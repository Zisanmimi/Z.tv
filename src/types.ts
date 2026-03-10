export interface Channel {
  id: number;
  name: string;
  logo: string;
  url: string;
  category: string;
}

export interface PlaylistData {
  header: any;
  items: Channel[];
}
