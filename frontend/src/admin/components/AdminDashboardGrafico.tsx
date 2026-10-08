import { Card } from "flowbite-react";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryTooltip } from "victory";

type AdminDashboardGraficoProps = {
  titulo: string;
  dados: { rotulo: string; quantidade: number }[];
  horizontal?: boolean;
};

const texto = { fontSize: 10, fill: "#6b7280", fontFamily: "inherit" };

export default function AdminDashboardGrafico({
  titulo,
  dados,
  horizontal = false,
}: AdminDashboardGraficoProps) {
  const maximo = Math.max(1, ...dados.map((dado) => dado.quantidade));
  const vazio = dados.every((dado) => dado.quantidade === 0);

  return (
    <Card className="min-w-0">
      <h3 className="text-base font-semibold text-gray-900">{titulo}</h3>
      {vazio ? (
        <p className="py-10 text-center text-sm text-gray-500">
          Nenhum pedido no período.
        </p>
      ) : (
        <VictoryChart
          horizontal={horizontal}
          width={horizontal ? 480 : 960}
          height={horizontal ? 40 * dados.length + 50 : 260}
          domain={{ y: [0, maximo] }}
          domainPadding={{ x: horizontal ? 18 : 10 }}
          padding={
            horizontal
              ? { top: 10, bottom: 30, left: 170, right: 20 }
              : { top: 10, bottom: 30, left: 40, right: 10 }
          }
        >
          <VictoryAxis
            tickFormat={(rotulo: string, indice: number) =>
              horizontal
                ? rotulo.length > 28
                  ? `${rotulo.slice(0, 27)}…`
                  : rotulo
                : indice % 5 === 4
                  ? rotulo
                  : ""
            }
            style={{ axis: { stroke: "#d1d5db" }, tickLabels: texto }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(valor: number) => (Number.isInteger(valor) ? valor : "")}
            style={{
              axis: { stroke: "transparent" },
              grid: { stroke: "#f3f4f6" },
              tickLabels: texto,
            }}
          />
          <VictoryBar
            data={horizontal ? [...dados].reverse() : dados}
            x="rotulo"
            y="quantidade"
            barWidth={14}
            cornerRadius={{ top: 4 }}
            labels={({ datum }) => `${datum.rotulo}: ${datum.quantidade}`}
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{ fill: "#ffffff", stroke: "#e5e7eb" }}
                style={{ ...texto, fill: "#111827" }}
              />
            }
            style={{ data: { fill: "#374151" } }}
          />
        </VictoryChart>
      )}
    </Card>
  );
}
