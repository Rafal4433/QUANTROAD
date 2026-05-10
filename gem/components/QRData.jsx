// Mock content for the kwantowo.pl site (articles, strategies, author).

(function(){
  const articles = [
    { id:'gem-pl', cat:'Strategia', date:'2025-09-22', readMin:14,
      title:'GEM na rynku polskim — czy momentum przeżyje koszty Belki?',
      lede:'Klasyczna strategia Antonacciego w warunkach IKE/IKZE, spreadu USD/PLN i niskiej płynności WIG. Sprawdzam 15 lat danych.',
      tags:['GEM','momentum','podatki'], featured:true },
    { id:'belka-tarcza', cat:'Podatki', date:'2025-09-08', readMin:9,
      title:'Tarcza IKE/IKZE — ile naprawdę oszczędzasz w 20 lat',
      lede:'Modeluję pełny cykl: wpłaty, narastanie, wypłata. Liczby pokazują coś, co większość kalkulatorów ucina.',
      tags:['IKE','IKZE','podatek Belki'] },
    { id:'sharpe-vs-ulcer', cat:'Metryki', date:'2025-08-31', readMin:7,
      title:'Sharpe kłamie. Ulcer Index jest bliżej prawdy.',
      lede:'Dlaczego mierzenie ryzyka odchyleniem standardowym to przeżytek z lat 70., i co warto liczyć dziś.',
      tags:['ryzyko','metryki'] },
    { id:'momentum-fail', cat:'Strategia', date:'2025-08-12', readMin:11,
      title:'Kiedy momentum zawodzi? 3 reżimy rynku, których algorytm nie lubi',
      lede:'Sideways, choppy bull, fast crash. Pokazuję dane z 2015–2018 i 2022.',
      tags:['momentum','reżimy'] },
    { id:'fx-spread', cat:'Egzekucja', date:'2025-07-28', readMin:6,
      title:'Spread USD/PLN zjada twoje alfa. Ile, kiedy i u kogo.',
      lede:'Porównanie 5 brokerów, 12 miesięcy notowań śróddziennych. Konkretne liczby, nie marketing.',
      tags:['FX','brokerzy'] },
    { id:'kelly-fractional', cat:'Wielkość pozycji', date:'2025-07-14', readMin:10,
      title:'Kelly fraktalny — dlaczego pełna formuła Cię zabije',
      lede:'Krótkie wyprowadzenie i pokaz, dlaczego ½ Kelly to nie kompromis, tylko racjonalność.',
      tags:['Kelly','sizing'] },
    { id:'wig-vs-msci', cat:'Analiza', date:'2025-06-30', readMin:8,
      title:'WIG vs MSCI World 2000–2025 — premia za polskie ryzyko?',
      lede:'25 lat danych. Czy emerging market discount się opłacał?',
      tags:['WIG','benchmark'] },
    { id:'gold-allocation', cat:'Alokacja', date:'2025-06-18', readMin:7,
      title:'Złoto w portfelu — 0%, 5% czy 20%? Backtest na 50 lat',
      lede:'Trzy podejścia, jeden wykres efektywności. Wynik nie jest taki, jak myślisz.',
      tags:['złoto','alokacja'] },
    { id:'btc-mom', cat:'Krypto', date:'2025-06-02', readMin:9,
      title:'BTC w GEM — czy ma sens dodać kryptowalutę do koszyka momentum?',
      lede:'Wysokie zwroty, ale brutalne drawdowny. Sprawdzam, jak histereza i sizing temperują BTC.',
      tags:['BTC','momentum'] },
  ];

  const strategies = [
    { id:'gem', name:'GEM — Global Equity Momentum', status:'live', cagr:11.8, dd:-14.2, sharpe:1.04, since:2010,
      lede:'Klasyczna rotacja Antonacciego w polskiej rzeczywistości podatkowej.',
      assets:['VTSMX','QQQ','VEIEX','GLD','SHY'], complexity:'średnia' },
    { id:'permanent', name:'Permanent Portfolio (Browne)', status:'live', cagr:6.4, dd:-8.7, sharpe:0.78, since:2008,
      lede:'25/25/25/25 — akcje, obligacje, złoto, gotówka. Spokojny sen.',
      assets:['VTSMX','TLT','GLD','SHY'], complexity:'niska' },
    { id:'dual-mom-bond', name:'Dual Momentum + Long Bonds', status:'live', cagr:9.7, dd:-11.2, sharpe:0.91, since:2012,
      lede:'Wariant GEM z TLT zamiast SHY. Większy zwrot, większy stress test.',
      assets:['VTSMX','VEIEX','TLT'], complexity:'średnia' },
    { id:'risk-parity', name:'Risk Parity 4-asset', status:'beta', cagr:7.9, dd:-9.4, sharpe:0.83, since:2014,
      lede:'Równe ryzyko między klasami aktywów, miesięczny rebalans.',
      assets:['VTSMX','TLT','GLD','VBMFX'], complexity:'wysoka' },
    { id:'wig-mom', name:'Polskie momentum (WIG40)', status:'beta', cagr:13.2, dd:-22.4, sharpe:0.86, since:2015,
      lede:'Top 5 spółek z WIG40 wg 6-miesięcznego momentum. Wysokie tarcie, ale alfa działa.',
      assets:['WIG40 stock-picking'], complexity:'wysoka' },
    { id:'butterfly', name:'Golden Butterfly', status:'live', cagr:7.2, dd:-7.8, sharpe:0.94, since:2010,
      lede:'Tyler portfolio: 20% × 5. Najbardziej stabilna krzywa kapitału w zestawie.',
      assets:['SCV','VTSMX','TLT','SHY','GLD'], complexity:'niska' },
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

  window.QRData = { articles, strategies, author, newsletter };
})();
