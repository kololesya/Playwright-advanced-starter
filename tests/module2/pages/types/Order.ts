export interface Order {
    price: string;
    quantity: string;
    side: 'Buy' | 'Sell';
}