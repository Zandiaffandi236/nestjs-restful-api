export class WebResponse<T> {
  status: string;
  message?: string;
  data?: T;
  paging?: Paging;
}

export class Paging {
  current_page: number;
  total_page: number;
  size: number;
}
