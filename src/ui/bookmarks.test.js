// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { CameraBookmarks } from './bookmarks.js';
import { setLang } from '../i18n/index.js';

const fakeCam = () => ({
  pivot: { toArray: () => [1, 2, 3], fromArray() {} },
  tPivot: { fromArray() {} },
  radius: 100,
  phi: 1,
  theta: 0.5,
  mode: 'fly',
  followBody: {},
});

describe('CameraBookmarks', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    setLang('it');
  });

  it('salva, carica e rimuove con nomi localizzati di default', () => {
    const bm = new CameraBookmarks();
    const entry = bm.save(fakeCam());
    expect(entry.name).toBe('Posizione 1');
    const cam = fakeCam();
    bm.load(cam, 0);
    expect(cam.mode).toBe('orbit');
    bm.remove(0);
    expect(bm.bookmarks.length).toBe(0);
  });

  it('usa il nome inglese di default con lingua EN', () => {
    setLang('en');
    const bm = new CameraBookmarks();
    expect(bm.save(fakeCam()).name).toBe('Location 1');
    setLang('it');
  });

  it('apre il pannello e persiste tra istanze', () => {
    const bm = new CameraBookmarks();
    bm.save(fakeCam(), 'Casa');
    bm.toggle(fakeCam());
    expect(document.getElementById('bookmarksPanel')).not.toBeNull();
    expect(document.getElementById('bmkList').textContent).toContain('Casa');
    const bm2 = new CameraBookmarks();
    expect(bm2.bookmarks.length).toBe(1);
  });
});
