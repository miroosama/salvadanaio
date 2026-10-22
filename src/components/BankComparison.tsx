"use client";

import {
  BANK_RATES,
  SALVADANAIO_ESTIMATED_RATE,
  ITALIAN_CRYPTO_TAX_RATE,
} from "@/lib/constants";
import PiggyLogo from "@/components/PiggyLogo";

export default function BankComparison() {
  const salvadanaioNetRate =
    SALVADANAIO_ESTIMATED_RATE * (1 - ITALIAN_CRYPTO_TAX_RATE / 100);

  return (
    <div className="w-full">
      <h3 className="font-display text-xl text-warmGray-800 mb-4">
        Rispetto alla tua banca
      </h3>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-warmGray-200">
              <th className="text-left py-3 pr-4 text-warmGray-500 font-medium">
                Istituto
              </th>
              <th className="text-right py-3 px-3 text-warmGray-500 font-medium">
                Lordo
              </th>
              <th className="text-right py-3 px-3 text-warmGray-500 font-medium">
                Netto
              </th>
              <th className="text-right py-3 pl-3 text-warmGray-500 font-medium">
                Vincolo
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Salvadanaio row - highlighted (the winner → mint) */}
            <tr className="bg-mint-50 border-b border-mint-100">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <PiggyLogo className="w-5 h-5" />
                  <span className="font-semibold text-mint-800">
                    Salvadanaio
                  </span>
                </div>
              </td>
              <td className="text-right py-3 px-3 font-semibold text-mint-700">
                {SALVADANAIO_ESTIMATED_RATE.toFixed(1)}%
              </td>
              <td className="text-right py-3 px-3 font-semibold text-mint-700">
                ~{salvadanaioNetRate.toFixed(1)}%
              </td>
              <td className="text-right py-3 pl-3 text-mint-700">Nessuno</td>
            </tr>

            {/* Bank rows */}
            {BANK_RATES.map((bank) => {
              const netRate = bank.grossRate * (1 - bank.taxRate / 100);
              return (
                <tr
                  key={bank.name}
                  className="border-b border-warmGray-100 text-warmGray-600"
                >
                  <td className="py-3 pr-4">{bank.name}</td>
                  <td className="text-right py-3 px-3">
                    {bank.grossRate.toFixed(1)}%
                  </td>
                  <td className="text-right py-3 px-3">
                    {netRate.toFixed(1)}%
                  </td>
                  <td className="text-right py-3 pl-3">{bank.lockup}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-warmGray-400 text-xs mt-3 leading-relaxed">
        * Tasso stimato, variabile in base alle condizioni di mercato. Le banche
        applicano una ritenuta del 20%, i proventi crypto sono tassati al 26%
        sulle plusvalenze.
      </p>
    </div>
  );
}
