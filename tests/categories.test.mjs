import { describe, expect, it } from 'vitest';
import { classifyEpisode } from '../scripts/crime-categories.mjs';
describe('editorial crime discovery tags', () => {
  it('does not classify every episode as serial killers because of the podcast name', () => {
    expect(
      classifyEpisode('Lead Masks Case', 'Ένα άλυτο μυστήριο. Στηρίξτε το Dumb and Dahmer Plus.'),
    ).toEqual(['unsolved']);
  });
  it('recognizes Greek accents, known names and English category terms', () => {
    expect(classifyEpisode('Joe Metheny', 'Ένας κατά συρροή δολοφόνος.')).toContain('serial-killers');
    expect(classifyEpisode('Jim Jones: Η αίρεση')).toContain('cults');
    expect(classifyEpisode('Μια ληστεία τράπεζας')).toContain('robberies');
    expect(classifyEpisode('Grigori Rasputin')).toContain('historical');
    expect(classifyEpisode('Μια εξαφάνιση')).toContain('disappearances');
  });
  it('allows multiple tags and keeps unmatched cases discoverable', () => {
    expect(classifyEpisode('An unsolved bank robbery')).toEqual(['robberies', 'unsolved']);
    expect(classifyEpisode('Μια άλλη υπόθεση')).toEqual(['other']);
  });
});
