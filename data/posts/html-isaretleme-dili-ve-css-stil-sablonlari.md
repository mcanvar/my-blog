---
title: "HTML İşaretleme Dili ve CSS Stil Şablonları"
slug: "html-isaretleme-dili-ve-css-stil-sablonlari"
date: "25/09/2016"
---

HTML İşaretleme Dili ve CSS Stil Şablonları
========================================
##HTML

HTML, temelleri 1990 yılında atılan, internet sayfalarını oluşturmak için kullanılan standart bir işaretleme dilidir. Bir programlama dili değildir, sadece çeşitli yorumlayıcılar (tarayıcılar vs.) tarafından yorumlanır.

Temel görevleri içerikleri ve bu içerikleri barındıran sayfaları birbirine bağlamak ve söz konusu sayfaların yorumlayıcılar tarafından düzgün olarak görüntülenmesi için gerekli kuralları belirlemektir. HTML sayfaları okunduktan sonra yorumlayıcılar tarafından yorumlandığı için farklı yorumlayıcılarda farklı görünümler vermesi muhtemeldir. Hatta bazı yanlış veya hatalı kullanımlar bu yorumlayıcılar tarafından düzeltilir.

HTML etiketleri küçüktür ve büyüktür karakterleri arasına yazılır ve aynı etiket kapanışta başına “/” karakteri alarak yinelenir, böylece bir eleman oluşur. Yapı hiyerarşiktir ve bazı elemanlar kapanış etiketine ihtiyaç duymazlar. Örneğin en basit haliyle bir HTML sayfası şu şekilde olabilir:

```
<HTML>
    <HEAD>
        <TITLE>Merhaba Dünya!</TITLE>
    </HEAD>
    <BODY>
        <P>Ben basit bir HTML sayfasıyım.</P>
    </BODY>
</HTML>
```


HTML kendi içine çeşitli betik dillerini gömmemize olanak sağlamasının yanında çeşitli stil şablonları ile görsel bir görünüm kazanabilir (CSS gibi).



##CSS



1980’lerde standartlaştırılana kadar birçok formu olan CSS internet sayfalarına stil eklemek için kullanılan basamaklı stil sayfalarıdır. HTML içerisinde var olan metin ve format biçimlendirmelerinin yetersiz olduğu noktalarda bizlere fazladan olanaklar sunar.

Bir HTML elemanını stil vermenin yanında bağlantılı birçok sayfadan oluşan internet sitelerinde her bir sayfa için aynı temada içeriklerin hazırlanmasıyla bir bütün oluşturulur. Bu bütünlüğü CSS veri tekrarı olmadan bağımsız bir şekilde stil dosyalarında tutabilir. Dosyalarda tutulan bu stil şablonları HTML sayfalarında çağrılarak kullanılabilir.

Bütün bunların yanında son sürümlerinde eklenilen özelliklerle beraber bir CSS stili ile HTML elemanları birçok özelliği barındırabilir. Ayrıca CSS sunduğu zengin özellik kümesi ile farklı cihazlar için tek sayfanın stil kazanmış halini formatlayabilir.

Günümüzde CSS sadece HTML sayfalarında değil birçok programlama kütüphanesi ile birlikte, önyüz işaretleme dili olarak kullanılır (JavaFX gibi).
