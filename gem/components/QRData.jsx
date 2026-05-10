// Mock content for the kwantowo.pl site (articles, strategies, author).

(function(){
  const articles = [
    { id:'sharpe-ratio', cat:'Metryki', date:'2025-10-01', readMin:8,
      title:'Sharpe Ratio w praktyce — co mówi, czego nie mówi i jak go liczyć',
      lede:'Jeden wskaźnik, który znajdziesz w każdym raporcie funduszu. Tłumaczę wzór, intuicję i granice stosowalności — z przykładami na prawdziwych danych.',
      tags:['ryzyko','metryki','sharpe'], href:'sharpe-ratio.html', featured:true },
  ];

  const strategies = [
    { id:'gem', name:'GEM — Global Equity Momentum', status:'live', cagr:11.8, dd:-14.2, sharpe:1.04, since:2010,
      lede:'Klasyczna rotacja Antonacciego w polskiej rzeczywistości podatkowej.',
      assets:['VTSMX','QQQ','VEIEX','GLD','SHY'], complexity:'średnia' },
  ];

  const author = {
    name: 'Jakub Kowalski',
    handle: '@kwantowo',
    bio: 'Były quant w funduszu hedgingowym, teraz prywatny inwestor. Buduję narzędzia i piszę o tym, co naprawdę działa po podatkach.',
    location: 'Warszawa, PL',
    since: 2019,
    posts: 142,
    readers: 3840,
  };

  // Newsletter / comm
  const newsletter = {
    subscribers: 3840,
    weekly: true,
    last: '2025-09-22',
    archive: 67,
  };

  // Tygodniowe digi — aktualizowane co piątek
  const digests = [
    {
      id: 'w39-2025',
      date: '2025-09-26',
      articles: [
        'GEM na rynku polskim — czy momentum przeżyje koszty Belki?',
      ],
      signals: [
        { strat: 'GEM', asset: 'US Equity (VTSMX)', change: false },
        { strat: 'Dual Mom + Bonds', asset: 'US Equity (VTSMX)', change: false },
        { strat: 'Permanent Portfolio', asset: 'hold — brak sygnału', change: false },
      ],
      chart: 'GEM vs S&P 500 — krzywa kapitału YTD 2025',
      note: null,
    },
  ];

  window.QRData = { articles, strategies, author, newsletter, digests };
})();
