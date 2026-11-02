// Treści strony: artykuły i strategie. Wyniki strategii liczy gemSummary.jsx.

(function(){
  const articles = [
    { id:'sharpe-ratio', cat:'Metryki', date:'2025-10-01', readMin:8,
      title:'Sharpe Ratio w praktyce — co mówi, czego nie mówi i jak go liczyć',
      lede:'Jeden wskaźnik, który znajdziesz w każdym raporcie funduszu. Tłumaczę wzór, intuicję i granice stosowalności — z przykładami na danych hipotetycznych.',
      tags:['ryzyko','metryki','sharpe'], href:'sharpe-ratio.html', featured:true },
  ];

  const strategies = [
    { id:'gem', name:'GEM — Global Equity Momentum', href:'gem.html',
      lede:'Rotacja momentum w stylu Antonacciego z polskim podatkiem Belki.',
      assets:['QQQ','VEIEX','GLD','TLT','SHY','VBMFX'], complexity:'średnia' },
  ];

  window.QRData = { articles, strategies };
})();
