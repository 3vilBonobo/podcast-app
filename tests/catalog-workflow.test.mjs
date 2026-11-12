import { it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { format } from 'prettier';

it('parses the prepared YAML and preserves the exact Athens schedules and manual entry point', async () => {
  const workflow = await format(await readFile('.github/workflows/refresh-catalog.yml', 'utf8'), {
    parser: 'yaml',
  });
  expect(
    [...workflow.matchAll(/cron: ["']([^"']+)["']\s+timezone: Europe\/Athens/g)].map((m) => m[1]),
  ).toEqual(['5 7 * * 3', '5 7 13 * *']);
  expect(workflow).toContain('workflow_dispatch:');
  expect(workflow).toContain('node scripts/catalog-schedule.mjs');
  expect(workflow).toContain('uses: ./.github/workflows/deploy-pages.yml');
});
it('keeps publication serialized, validated and gated by the real importer outputs', async () => {
  const workflow = await format(await readFile('.github/workflows/deploy-pages.yml', 'utf8'), {
    parser: 'yaml',
  });
  expect(workflow).toContain('branches: [master]');
  expect(workflow).toContain('queue: max');
  expect(workflow).toContain('cancel-in-progress: false');
  expect(workflow).toContain("if: needs.build.outputs.ready == 'true'");
  expect(workflow).toContain(
    "if: inputs.refresh_catalog != true || steps.sync.outputs.should_publish == 'true'",
  );
  expect(workflow.indexOf('run: npm test')).toBeLessThan(workflow.indexOf('commit -m'));
  expect(workflow.indexOf('npm run build')).toBeLessThan(workflow.indexOf('commit -m'));
  expect(workflow).toContain('git push origin HEAD:master');
  expect(workflow).toContain('EXPECTED_SHA:');
});
it('deploys the prepared artifact directly instead of relying on a GITHUB_TOKEN push trigger', async () => {
  const deploy = await readFile('.github/workflows/deploy-pages.yml', 'utf8');
  const refresh = await readFile('.github/workflows/refresh-catalog.yml', 'utf8');
  expect(deploy).toContain('workflow_call:');
  expect(refresh).toMatch(
    /publish:[\s\S]*permissions:\s+contents: write\s+pages: write\s+id-token: write[\s\S]*uses: \.\/\.github\/workflows\/deploy-pages.yml/,
  );
  expect(deploy).toMatch(/build:[\s\S]*permissions:\s+contents: write\s+pages: read/);
  expect(deploy).toMatch(
    /deploy:[\s\S]*needs: build[\s\S]*pages: write\s+id-token: write[\s\S]*environment:[\s\S]*name: github-pages/,
  );
  expect(deploy).toContain('uses: actions/upload-pages-artifact@v4');
  expect(deploy).toContain('uses: actions/deploy-pages@v4');
  expect(deploy.indexOf('Upload Pages artifact')).toBeGreaterThan(
    deploy.indexOf('git push origin HEAD:master'),
  );
});
