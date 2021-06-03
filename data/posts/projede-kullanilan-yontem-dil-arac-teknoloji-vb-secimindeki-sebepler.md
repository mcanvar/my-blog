---
title: "Projede Kullanılan Yöntem, Dil, Araç, Teknoloji vb. Seçimindeki Sebepler"
slug: "projede-kullanilan-yontem-dil-arac-teknoloji-vb-secimindeki-sebepler"
date: "23/10/2016"
---

Projede Kullanılan Yöntem, Dil, Araç, Teknoloji vb. Seçimindeki Sebepler
========================================
Günümüze doğru geldikçe büyüyen içeriği ile artık günlük ortalama 25 000 girdi girilen bir platform olan Ekşi Sözlük çok yoğun bir veri akışına sahiptir. 2012’de açıkladığı istatistiklere göre günlük yüzbinlerce tekil organik ziyarete sahip, bu ziyaretçilerin %72’sinin birden çok sayfasını ziyaret ettiği, hemen çıkma oranının %7 gibi çok düşük bir oran olduğu ve birçok işletim sisteminden, tarayıcıdan mobil cihazlar dâhil olmak üzere takip edilen devasa bir veri deposudur.

Barındırdığı verilerin tamamına yakını yazar olmayan, okuyucu kitlesi tarafından ulaşılabilir haldedir. Fakat tutulan bütün bu içeriğin formatı, yazarlara bırakıldığı için özellikle girdi verisi gibi binlerce karakter barındıran alanlarda veriyi temizlemek, seçmek, dönüştürmek, veri madenciliği yapmak, örüntüleri değerlendirmek ve bilgiyi sunabilmek; birçok araç/gereç, güçlü bir programlama dili, uygun bir mimari deseni gibi ortam ihtiyaçlarını doğurur. Bütün bu güçlü yapıyı ele alacak olan teknolojilerin geliştiricisine sunduğu hizmetin geniş çaplı, hızlı ve esnek olması beklenir. Aksi takdirde bu tür büyük veriler ile işlem yapmak sonu kestirilemez vakit ve emek kayıplarına sebebiyet verir.

Açıklanan boyuttaki ihtiyacı karşılayabilecek maliyetli ortamlardan daha çok, platform bağımsız, mümkünse açık kaynak kodlu, ücretsiz ve en önemlisi bu alanda kendini kanıtlamış seçeneklere yönelmek gerekir. Bu bağlamda veri tabanı ihtiyacı için MySQL, web tabanlı programlama için PHP, arayüz ve destek için Bootstrap, HTML/CSS/JavaScript ve JQuery, geliştirme aracı olarak import.io, geliştirme ortamı olarak NetBeans ve son olarak mimari deseni olarak da MVC uygun görüldü.

Gerekli duyulduğunda başvurulmak üzere birçok kütüphane bulunduran PHP Betik Programlama Dili gerektiğinde ihtiyaç duyabileceğimiz kütüphane zenginliği ve çalışma hızı nedeniyle seçildi. Her bir güncelleştirme sonucu artacak olan veri trafiğinin getireceği ağır yükü üstlenip hızlı bir şekilde cevap verebilecek bir yapıya sahiptir. Bunun yanında MySQL’in PHP ile uyumu ve sunduğu kanıtlanmış desteği de göz önünde bulundurularak veri tabanı ihtiyacı için seçildi. MySQL internet tabanlı olarak PHPMyAdmin gibi araçlar yardımı ile yönetilebileceği gibi MySQL Workbench gibi yönetim sistemleri ile de yönetilebilir. Ayrıca sunduğu birçok ortamda çalışabilme desteği ve nerdeyse bütün dosya tiplerindeki verileri kolaylıkla içeriye aktarabilmek bu teknolojiyi seçmekteki önemli etkenlerden biridir.

Görsel olarak zamanın ihtiyaçlarını karşılayabilecek birçok tasarım yapılabilir, fakat yapılacak tasarım hem bir yetenek hem de zaman gerektirdiği için projede kullanmak üzere bir önyüz çatısı belirlendi. Bootstrap çatısının parçacıklarının kullanımı günümüzde oldukça yaygındır. Tercih edilmesinin en büyük etkenlerinden biri her bir çözünürlük için etkin bir tepki yapısının olmasıdır. Bunun yanında JQuery kütüphanesinin güçlü yapısı, CSS3/HTML5 teknolojileriyle bir araya geldiğinde ortaya güçlü ve modern bir ortam çıkarır. Kullanıcılarına işlevsel ve kullanılabilirliği olan bir yapı sunar.
