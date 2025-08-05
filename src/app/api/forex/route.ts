import { NextResponse } from 'next/server';
import type { FinancialPair } from '@/types/signal';
import { ALL_PAIRS } from '@/lib/mock-data';

const forexPairs = ALL_PAIRS.filter(p => p.category === 'Forex').map(p => p.pair);

type LivePrices = Record<FinancialPair, number>;

export async function GET() {
    const apiKey = process.env.FOREX_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY') {
        return NextResponse.json({ error: 'Forex API key is not configured.' }, { status: 500 });
    }

    const apiPairs = forexPairs.map(p => p.replace('/', '')).join(',');
    const url = `https://api.forexapi.dev/v1/live?pairs=${apiPairs}&api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data: any = await response.json();
        
        if (data.error) {
            return NextResponse.json({ error: `Forex API Error: ${data.message}` }, { status: 500 });
        }

        const newPrices: LivePrices = {} as LivePrices;
        forexPairs.forEach(pair => {
            const apiPair = pair.replace('/', '');
            if (data.rates[apiPair]) {
                newPrices[pair] = data.rates[apiPair].price;
            }
        });

        return NextResponse.json({ prices: newPrices });

    } catch (error: any) {
        return NextResponse.json({ error: `Failed to fetch from Forex API: ${error.message}` }, { status: 500 });
    }
}
