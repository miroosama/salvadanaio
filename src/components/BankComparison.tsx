"use client";

import { COMPARISON_ROWS, netYield } from "@/lib/constants";
import { useAaveApy } from "@/hooks/useAaveApy";
import PiggyLogo from "@/components/PiggyLogo";

export default function BankComparison() {
  const { apy } = useAaveApy();
  const salvadanaioNetRate = netYield(apy);

  return (
    <div className="w-full">
      <h3 className="font-display text-xl text-warmGray-800 mb-4">
        Come si confronta
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-warmGray-200">
              <th className="text-left py-3 pr-2 text-warmGray-500 font-medium">
                Opzione
              </th>
              <th className="text-right py-3 px-2 text-warmGray-500 font-medium whitespace-nowrap">
                Lordo
              </th>
              <th className="text-right py-3 px-2 text-warmGray-500 font-medium whitespace-nowrap">
                Netto
              </th>
              <th className="text-right py-3 pl-2 text-warmGray-500 font-medium whitespace-nowrap">
                Vincolo
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-mint-50">
              <td className="py-3 pl-2 pr-2 rounded-l-lg">
                <div className="flex items-center gap-2">
                  <PiggyLogo className="w-5 h-5 shrink-0" />
                  <span className="font-semibold text-mint-800">
                    Salvadanaio
                  </span>
                </div>
              </td>
              <td className="text-right py-3 px-2 font-semibold text-mint-700 whitespace-nowrap">
                {apy.toFixed(1)}%
              </td>
              <td className="text-right py-3 px-2 font-semibold text-mint-700 whitespace-nowrap">
                ~{salvadanaioNetRate.toFixed(1)}%
              </td>
              <td className="text-right py-3 pr-2 pl-2 text-mint-700 whitespace-nowrap rounded-r-lg">
                Nessuno
              </td>
            </tr>

            {COMPARISON_ROWS.map((row) => (
              <tr
                key={row.label}
                className="border-b border-warmGray-100 text-warmGray-600"
              >
                <td className="py-3 pr-2">{row.label}</td>
                <td className="text-right py-3 px-2 whitespace-nowrap">
                  {row.gross}
                </td>
                <td className="text-right py-3 px-2 whitespace-nowrap">
                  {row.net}
                </td>
                <td className="text-right py-3 pl-2 whitespace-nowrap">
                  {row.lockup}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-warmGray-600 text-xs mt-3 leading-relaxed">
        * Il nostro tasso è quello Aave live su Base, variabile. Il netto è
        stimato con la tassazione più severa per le crypto (33% + ~0,2% annuo di
        imposta sul valore); gli interessi bancari sono tassati al 26%. Le altre
        voci sono valori indicativi di mercato. Stima, non è consulenza fiscale.
      </p>
    </div>
  );
}
