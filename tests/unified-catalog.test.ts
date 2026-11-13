import {afterEach, expect, it, vi} from 'vitest';
import {Component, Input, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {provideTransloco} from '@jsverse/transloco';
import {EpisodesComponent} from '../src/app/features/episodes/episodes';
import {PodcastService} from '../src/app/core/podcast.service';
import {BundledTranslationLoader} from '../src/app/core/transloco-loader';
import {EpisodeCardComponent} from '../src/app/shared/episode-card';
import {IconComponent} from '../src/app/shared/icon';
import {EmptyStateComponent} from '../src/app/shared/empty-state';
import type {Episode} from '../src/app/core/models';
import catalog from '../public/data/catalog.json';
import overrides from '../editorial/overrides.json';
import {applyEditorial} from '../src/app/core/editorial.mjs';

@Component({selector:'dd-episode-card',template:''}) class Card { @Input() episode: unknown; }
@Component({selector:'dd-icon',template:''}) class Icon { @Input() name=''; }
@Component({selector:'dd-empty',template:''}) class Empty { @Input() icon=''; @Input() title=''; @Input() description=''; }
const real = applyEditorial(catalog, overrides).episodes as Episode[];
const sample = [
  {...real[0],id:'regular',season:1,countries:['GB'],categories:['other'],tags:['double-slashers'],title:'Matched case',publishedAt:'2026-01-01',contentKind:'public-episode'},
  {...real[0],id:'preview',season:5,countries:['US'],categories:['other'],tags:['specials'],title:'Matched preview',publishedAt:'2026-02-01',contentKind:'promotional-preview'},
  {...real[0],id:'trailer',season:null,countries:[],categories:['other'],tags:[],title:'Trailer',publishedAt:'2025-01-01',contentKind:'public-episode'},
] as Episode[];
afterEach(()=>TestBed.resetTestingModule());
async function open(query='', initial: Episode[]=[]) {
  const episodes=signal(initial);
  TestBed.configureTestingModule({providers:[
    provideRouter([{path:'episodes',component:EpisodesComponent}]),
    provideTransloco({config:{availableLangs:['el','en'],defaultLang:'en',prodMode:true},loader:BundledTranslationLoader}),
    {provide:PodcastService,useValue:{episodes,collections:signal([]),catalog:signal(null),loading:signal(false),refreshing:signal(false),refreshStatus:signal('idle'),error:signal('')}}
  ]});
  TestBed.overrideComponent(EpisodesComponent,{remove:{imports:[EpisodeCardComponent,IconComponent,EmptyStateComponent]},add:{imports:[Card,Icon,Empty]}});
  const harness=await RouterTestingHarness.create();
  const view=await harness.navigateByUrl('/episodes'+query,EpisodesComponent);
  const router=TestBed.inject(Router);
  const settle=async()=>{await harness.fixture.whenStable();harness.detectChanges();};
  return {episodes,harness,view,router,settle};
}
it('defaults to the entire real snapshot with unique GUIDs and mixed chronological ordering',async()=>{
 const {view}=await open('',real);
 expect(view.filtered()).toHaveLength(real.length);
 expect(new Set(view.filtered().map(e=>e.id)).size).toBe(real.length);
 expect(view.filtered().map(e=>Date.parse(e.publishedAt))).toEqual(real.map(e=>Date.parse(e.publishedAt)).sort((a,b)=>b-a));
 expect(view.filtered().some(e=>e.contentKind==='promotional-preview')).toBe(true);
 expect(view.visible()).toHaveLength(20);
});
it.each(['all','regular','plus'])('derives %s counts and season choices from the current catalog',async(type)=>{
 const {view}=await open(type==='all'?'':'?view='+type,real);
 const expected=real.filter(e=>type==='all'||(e.contentKind==='promotional-preview')===(type==='plus'));
 expect(view.collectionEpisodes()).toEqual(expected);
 expect(view.filtered()).toHaveLength(expected.length);
 expect(view.availableSeasons()).toEqual([...new Set(expected.map(e=>e.season).filter(s=>s!==null))].sort((a,b)=>b-a));
});
it.each(['1','none','bad','999'])('waits for asynchronous data then removes unavailable Plus season %s from the real URL',async(season)=>{
 const {episodes,view,router,settle,harness}=await open('?view=plus&season='+season+'&country=US&tag=specials&q=Matched&sort=oldest');
 expect(router.parseUrl(router.url).queryParams['season']).toBe(season);
 const navigation=vi.spyOn(router,'navigate');
 await Promise.resolve(); episodes.set(sample); await settle();
 expect(router.parseUrl(router.url).queryParams).toEqual({view:'plus',country:'US',tag:'specials',q:'Matched',sort:'oldest'});
 expect(view.season()).toBe('all');
 expect((harness.routeNativeElement!.querySelector('select') as HTMLSelectElement).value).toBe('all');
 expect(view.filtered().map(e=>e.id)).toEqual(['preview']);
 expect(navigation).toHaveBeenCalledOnce();
});
it.each(['all','regular','plus'])('preserves a valid season after asynchronous initialization in %s',async(type)=>{
 const season=type==='regular'?'1':'5';
 const {episodes,view,router,settle,harness}=await open('?view='+type+'&season='+season+'&sort=oldest');
 episodes.set(sample);await settle();
 expect(router.parseUrl(router.url).queryParams['season']).toBe(season);
 expect(view.season()).toBe(season);
 expect((harness.routeNativeElement!.querySelector('select') as HTMLSelectElement).value).toBe(season);
});
it('changes type and removes an unavailable season in one navigation while preserving applicable filters',async()=>{
 const {view,router,settle}=await open('?view=regular&season=1&q=Matched&country=GB&tag=double-slashers&sort=oldest',sample);
 const navigation=vi.spyOn(router,'navigate');
 view.limit.set(60);view.setFilter('view','plus');await settle();
 expect(router.parseUrl(router.url).queryParams).toEqual({view:'plus',q:'Matched',country:'GB',tag:'double-slashers',sort:'oldest'});
 expect(view.limit()).toBe(20);expect(view.filtered()).toEqual([]);
 expect(navigation).toHaveBeenCalledOnce();
 view.clear();await settle();
 expect(router.url).toBe('/episodes');expect(view.contentType()).toBe('all');expect(view.filtered()).toHaveLength(3);
});
it('retains valid season selections across type changes and resets pagination on URL changes',async()=>{
 const {view,router,settle}=await open('?view=regular&season=1&sort=oldest',sample);
 view.setFilter('view','');await settle();expect(view.season()).toBe('1');
 view.limit.set(60);await router.navigateByUrl('/episodes?view=plus&season=5');await settle();
 expect(view.season()).toBe('5');expect(view.limit()).toBe(20);
});
it('revalidates season after a catalog change without clearing search, country or sort',async()=>{
 const {episodes,view,router,settle}=await open('?view=plus&season=5&country=US&q=Matched&sort=oldest',sample);
 episodes.set(sample.map(e=>e.id==='preview'?{...e,season:4}:e));await settle();
 expect(router.parseUrl(router.url).queryParams).toEqual({view:'plus',country:'US',q:'Matched',sort:'oldest'});
 expect(view.filtered().map(e=>e.id)).toEqual(['preview']);
});
it('keeps all filters on a valid catalog refresh and finds a preview through default All search',async()=>{
 const {episodes,view,router,settle}=await open('?q=Matched&country=US&tag=specials&category=other&season=5&sort=oldest',sample);
 const url=router.url;
 expect(view.filtered().map(e=>e.id)).toEqual(['preview']);
 episodes.set(sample.map(e=>({...e,description:'Refreshed metadata'})));await settle();
 expect(router.url).toBe(url);expect(view.filtered().map(e=>e.id)).toEqual(['preview']);
});
it('shows three translated pressed-state controls and expands pagination without duplicate entries',async()=>{
 const {harness,view,settle}=await open('',real);
 const buttons=Array.from(harness.routeNativeElement!.querySelectorAll('.collection-switch button'));
 expect(buttons.map(b=>b.textContent?.trim())).toEqual(['All Episodes','Regular Episodes','Plus Previews']);
 expect(buttons.map(b=>b.getAttribute('aria-pressed'))).toEqual(['true','false','false']);
 const more=Array.from(harness.routeNativeElement!.querySelectorAll('button')).find(b=>b.textContent?.includes('More stories'))!;
 more.click();await settle();
 expect(view.visible()).toHaveLength(40);expect(new Set(view.visible().map(e=>e.id)).size).toBe(40);
 view.setFilter('view','plus');await settle();
 expect(view.limit()).toBe(20);expect(view.filtered()).toHaveLength(real.filter(e=>e.contentKind==='promotional-preview').length);
});
