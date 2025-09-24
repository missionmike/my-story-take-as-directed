export interface GoogleDocsContent {
  title: string;
  content: string;
  tabs: Array<{
    title: string;
    content: string;
  }>;
}
