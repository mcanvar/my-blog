---
title: "import.io Uygulama Programlama Arayüzü"
slug: "import-io-uygulama-programlama-arayuzu"
date: "19/11/2016"
---

import.io Uygulama Programlama Arayüzü
========================================
Eylül 2013 de beta sürümüyle yayınlanan servis, herhangi bir kod yazmadan bile veri ayıklayabilen internet tabanlı bir platformdur. İçinde yer alan araçlar kullanıcının tamamen kendisinin tıklamalarıyla oluşturulan basit makine öğrenmeleriyle kullanıcılarına kendilerine özel UPA(Application Programming Interface) oluşturmalarına izin verir.

Basitçe, kullanıcılar veri elde etmek istedikleri internet sitesini ziyaret eder, elde etmek istediği verileri tiplerine göre tablo sütunlarına yerleştirip, tabloları isimlendirir ve bu verileri elde ettiği sayfalarda bir dizi alıştırmalar yaparak algoritmalar üzerinde makine öğrenmesi yaparlar. Elde edilmiş değerli veri import.io’nun bulut sistemlerinde depolanır ve kullanıcının kendine has UPA’sı ile sorgulanabilir hale gelir. Veriler ayrıca bulut sisteminden CSV, Excel, Google Sheets veya JSON dosyaları olarak indirilebilir, HTML, JSON ve XML çıktıları olarak sorgulanabilir, paylaşılabilir.

Daha teknik kullanıcıları için import.io, JSON SDA(Sunumsal Durum Aktarımı (representational state transfer)) tabanlı yayın UPA’ları üzerinden gerçek tabanlı veri almayı mümkün kılar. 100 veri kaynağına kadar eş zamanlı olarak sorgulanabilen federal bir yapıyla beraber birçok yaygın kullanıma sahip programlama dili ve veri işleme araçları ile uyumludur.

Olabildiğince kaynak odaklı linkleri elde etmek ve UPA durumlarını HTTP durum kodlarını kullanarak belirlemek için tasarlanmıştır. Sistem standart HTTP protokolünü kullanmaktadır. Kullanıcıya istemci-tabanlı internet uygulamasından import.io UPA’sı ile etkileşimde bulunabilmesi için ÇKKP’yı(Çarpraz-Köken Kaynak Paylaşımı (cross-origin res. sharing)) destekler. Böylece kullanıcı hiçbir zaman kendi gizli UPA anahtarını bir kaynak kodunda barındırmaz.

JSON UPA tarafından her zaman hatalarla beraber bir cevap olarak döndürülür. Bütün UPA istekleri HTTPS protokolü üzerinden yapılır. UPA sayesinde bir kullanıcı veri almak istediği bir internet sitesinde giriş yaparak bile otomatik sorgular oluşturabilir.
