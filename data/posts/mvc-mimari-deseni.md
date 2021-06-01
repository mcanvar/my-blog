---
title: "MVC Mimari Deseni"
slug: "mvc-mimari-deseni"
date: "23-10-2016"
---


Mimari desenlerinin(software pattern) arkasındaki esas düşünce yüksek seviyeli etkileşimleri özümsemek ve nesneler arasındaki bu davranışları başka uygulamalarda tekrardan kullanabilmektir. Her bir desen tekrar tekrar oluşan bir problemi ele alır ve çözümün temelini açıklar. Daha sonra bu çözüm tekrar tekrar defalarca kullanılabilir.
MVC Mimari Deseni’nin işleyiş şeması. MVC Mimari Deseni’nin işleyiş şeması.

[MVC](https://mevlutcanvar.com.tr/codeignitera-giris-crud-uygulamasi), internet uygulamalarının mimarisini oluşturmak için ilk defa 1979 yılında tanıtılmıştır. Geniş bir kullanıcı kitlesine sahip olan bu mimari desen, birçok dilde desteği ve kütüphaneleri ile amacı kullanıcı arayüzü, iş mantığı ve veri akışını birbirinden ayırmak isteyen geliştiricilerin tercihidir.

MVC temel olarak üç yapıya ayrılır: Model, View ve Controller. Bu yapılar sayesinde iş mantığı farklı uygulamalarda defalarca kullanılabilir, iş mantığının yapısını bozmadan istenildiği kadar kullanıcı arayüzü oluşturulabilir. Ayrıca, kod tekrarları önlenir, düzenli yükseltmeler, geliştirmeler ve bakım yapılabilir.

Kullanıcı arayüzü tasarımcıları iş mantığının içerisinde kaybolmadan, iş mantığı geliştiricileri ise görsel öğeler içerisinde boğulmadan iş mantığı gerçekleştirebilir ve buna odaklanabilirler. Her iki geliştirici veya iki geliştirici takımı diğerinin işleyişini önlemeden işlerini yaparlar. Böylece büyük bir iş verimliliği ve düzen süreci doğar.

Ortaya çıkan iletişim ihtiyacını ise [UPA](https://mevlutcanvar.com.tr/import-io-uygulama-programlama-arayuzu) ’lar karşılar. Tıpkı bir yapıştırıcı gibi Model, View ve Controller’lar arasında iletişimi sağlar. Bir Controller birçok yoldan Model üzerindeki metotları çağırabilir, Model bir veya birden çok veri tabanı üzerine veri yazıp okuyabilir.    
