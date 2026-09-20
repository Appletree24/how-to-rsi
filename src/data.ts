import siteData from '../content/site-data.json';
import researchChapters from '../content/research-chapters.json';
import capstoneChapters from '../content/capstone-chapters.json';
import sources from '../content/sources.json';

export interface Chapter {
  id: string;
  num: string;
  title: string;
  short: string;
  blurb: string;
  icon: string;
  module: string;
}

export interface CourseModule {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

const chapters: Chapter[] = [...siteData.chapters];
const after = chapters.findIndex(chapter => chapter.id === 'carriers') + 1;
chapters.splice(after, 0, ...researchChapters, ...capstoneChapters);
const modules: CourseModule[] = [...siteData.modules];
modules.splice(2, 0,
  { id: 'research', name: '论文与实验', desc: '自改机制、统计方法与研究练习', icon: 'book' },
  { id: 'capstone', name: 'RepoOps Lab', desc: '仓库运维 Agent 与评测系统', icon: 'book' },
);

export const DSH = { ...siteData, chapters, modules, sources };
