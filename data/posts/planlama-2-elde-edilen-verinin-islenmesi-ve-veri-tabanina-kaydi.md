---
title: "Planlama: 2. Elde Edilen Verinin İşlenmesi ve Veri Tabanına Kaydı"
slug: "planlama-2-elde-edilen-verinin-islenmesi-ve-veri-tabanina-kaydi"
date: "23/09/2016"
---

Planlama: 2. Elde Edilen Verinin İşlenmesi ve Veri Tabanına Kaydı
========================================
Önceki adımdan elde edilen verilerin bir mantık motorundan geçirilmesi gerekir. Bu
motorun PHP betik programlama dili ile yapılandırılacağı ve elde edilen girdi dizinin
her bir öğesinin veri madenciliği yöntemleri ile programlanan algoritmadan geçirilip
duygu etiketlemelerinin yapılacağı adımdır.

Proje NetBeans ortamında MVC yapısı ile oluşturulup öncelikle oluşturulan
Connector’lardan gelen nesneler birer PHP sıralı eşlem dizisine dönüştürülürler. Artık
tamamen betik değişkenine dönüşen girdiler, üzerinde algoritma uygulamaya müsait
haldedir. Gerçekleştirilen algoritma ile gündemde olan başlıklardaki yeni girdilerin
sorgusu ile şükela modunun sorgusu birbiri ile kesiştirilir ve ortak kümede en çok
beğenilenden en az doğru sıralanır. İçinde yetişkin içerik imlemesi de yapıldıktan
sonra elde edilen bu işlenmiş veri artık veri madenciliği için hazır durumdadır.

Projeye uygulanacak olan veri madenciliği yönteminde en iyi sonucu veren algoritma,
belirlenen bir karmaşık ham girdi yığını ile belirlenir. Oluşturulacak olan bu veri
motoruna girecek ham veri ve çıkacak olan işlenmiş veriler belirlenir ve seçilen veri
madenciliği algoritmasıyla kullanılacak olan algoritma yazılır. Belirlenen bu algoritma
ile girdiler teker teker duygusal anlamda “mutlu” ve “mutsuz” arasında işaretlenir ve
yüzdelik hesabı belirlenir.

Veri tabanı oluşturmak için varlık-bağlantı modeli oluşturulur. MySQL veri tabanı
yapısı şekillendirilir ve modellemeler yapılır. Her bir varlığın türü, uzunluğu ve tipi
belirlenir. İlişkiler belirlenir. Henüz proje yapısı tam olarak şekillenmediği için
oluşturulan her bir veri kanalı için veri tabanı kayıt sayfaları oluşturulur.
