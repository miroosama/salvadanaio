"use client";

import { BANK_RATES, netYield } from "@/lib/constants";
import { useAaveApy } from "@/hooks/useAaveApy";
import PiggyLogo from "@/components/PiggyLogo";

export default function BankComparison() {
  const { apy } = useAaveApy();
  const salvadanaioNetRate = netYield(apy);

  return (
    <div className="w-full">
      <h3 className="font-display text-xl text-warmGray-800 mb-4">
        Rispetto alla tua banca
      </h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-warmGray-200">
            <th className="text-left py-3 pr-3 text-warmGray-500 font-medium">
              Istituto
            </th>
            <th className="text-right py-3 px-3 text-warmGray-500 font-medium whitespace-nowrap">
              Lordo
            </th>
            <th className="text-right py-3 px-3 text-warmGray-500 font-medium whitespace-nowrap">
              Netto
            </th>
            <th className="text-right py-3 pl-3 text-warmGray-500 font-medium whitespace-nowrap">
              Vincolo
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-mint-50">
            <td className="py-3 pl-3 pr-3 rounded-l-lg">
              <div className="flex items-center gap-2">
                <PiggyLogo className="w-5 h-5 shrink-0" />
                <span className="font-semibold text-mint-800">Salvadanaio</span>
              </div>
            </td>
            <td className="text-right py-3 px-3 font-semibold text-mint-700 whitespace-nowrap">
              {apy.toFixed(1)}%
            </td>
            <td className="text-right py-3 px-3 font-semibold text-mint-700 whitespace-nowrap">
              ~{salvadanaioNetRate.toFixed(1)}%
            </td>
            <td className="text-right py-3 pr-3 pl-3 text-mint-700 whitespace-nowrap rounded-r-lg">
              Nessuno
            </td>
          </tr>

          {BANK_RATES.map((bank) => {
            const netRate = bank.grossRate * (1 - bank.taxRate / 100);
            return (
              <tr
                key={bank.name}
                className="border-b border-warmGray-100 text-warmGray-600"
              >
                <td className="py-3 pr-3 whitespace-nowrap">{bank.name}</td>
                <td className="text-right py-3 px-3 whitespace-nowrap">
                  {bank.grossRate.toFixed(1)}%
                </td>
                <td className="text-right py-3 px-3 whitespace-nowrap">
                  {netRate.toFixed(1)}%
                </td>
                <td className="text-right py-3 pl-3 whitespace-nowrap">
                  {bank.lockup}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="text-warmGray-400 text-xs mt-3 leading-relaxed">
        * Tasso Aave live su Base mainnet, variabile. Gli interessi bancari sono
        tassati al 26%; le plusvalenze crypto al 33% (più ~0,2% annuo di imposta
        sul valore). Stima, non è consulenza fiscale.
      </p>
    </div>
  );
}
