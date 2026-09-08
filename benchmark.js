const steps = Array.from({ length: 1000 }, (_, i) => ({
  dv: Math.random() * 100,
  dvMax: Math.random() * 150,
  returnDv: i % 2 === 0 ? Math.random() * 100 : undefined
}));

function oldWayReturn() {
  return steps
    .map(step => step.returnDv != null ? step.returnDv : step.dv)
    .reduce((dv1, dv2) => dv1 + dv2);
}

function newWayReturn() {
  return steps.reduce((acc, step) => acc + (step.returnDv != null ? step.returnDv : step.dv), 0);
}

function oldWayTotal() {
  return {
    dv: steps.map(step => step.dv).reduce((dv1, dv2) => dv1 + dv2),
    dvMax: steps.map(step => step.dvMax ?? step.dv).reduce((dv1, dv2) => dv1 + dv2)
  };
}

function newWayTotalSeparateReduce() {
  return {
    dv: steps.reduce((acc, step) => acc + step.dv, 0),
    dvMax: steps.reduce((acc, step) => acc + (step.dvMax ?? step.dv), 0)
  };
}

function newWayTotalSingleReduce() {
  return steps.reduce((acc, step) => {
    acc.dv += step.dv;
    acc.dvMax += (step.dvMax ?? step.dv);
    return acc;
  }, { dv: 0, dvMax: 0 });
}

function runBenchmark(name, fn, iterations) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  console.log(`${name}: ${end - start}ms`);
}

const ITERATIONS = 100000;
runBenchmark('Old Return', oldWayReturn, ITERATIONS);
runBenchmark('New Return', newWayReturn, ITERATIONS);
runBenchmark('Old Total', oldWayTotal, ITERATIONS);
runBenchmark('New Total (Separate)', newWayTotalSeparateReduce, ITERATIONS);
runBenchmark('New Total (Single)', newWayTotalSingleReduce, ITERATIONS);
