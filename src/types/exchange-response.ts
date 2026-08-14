/** Shape of https://open.er-api.com/v6/latest/USD's response body. */
export interface ExchangeResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
}
