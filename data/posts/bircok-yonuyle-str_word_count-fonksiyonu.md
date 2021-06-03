---
title: "Birçok yönüyle str_word_count Fonksiyonu"
slug: "bircok-yonuyle-str_word_count-fonksiyonu"
date: "10-04-2016"
---

Prototipi:
<pre>
mixed str_word_count ( string $string [, int $format = 0 [, string $charlist ]] )
</pre>
Bu fonksiyonun temel olarak yaptığı iş karakter katarındaki(string) kelime sayısını bize tam sayı(int) tipinde geri döndürmesidir. Tabi prototipten de anlaşılacağı üzere bu işi formatlı olarak da yapabiliyor. Eğer format verilmişse döndürdüğü değer bir dizge(array) oluyor, tabi bu dönen değer belirtilen formatta oluyor. Gönderilen yazının tek tırnak(‘) ve tire(-) ile başlamaması gerekiyor.

Format değişkenini 0 olarak ayarlarsak dönüş değeri kelime sayısı, 1 ile ayarlarsak bütün kelimeleri bir dizge(array) olarak ve 2 diye ayarlarsak da bütün kelimeleri bir dizge olarak gerçek indisleri ile beraber döndürür.

Farkettiğiniz üzere üçüncü bir opsiyonel parametre daha alıyor. PHP 5.1.0 verisyonunu ile eklenen bu parametre sayesinde fonksiyona bir karakter listesi gönderebiliyoruz, fonksiyonumuz bu listeye bakarak bölünme sırasında bu karakterlerden birine raslar ise görmezden gelip sonraki kelimeye ilerliyor. Örneğin bir karakter katarında “… 3adımda uygulanır …” gibi 2 kelimelik bir kısım olsun. Buradaki 2 kelimeyi fonksiyonumuza “3” karakter listesini parametre olarak vermez ise bölmeyi şu şekilde yapacaktır: …, “adımda”, “uygulanır”, …

Bir diğer bilmemiz gereken husus tıpkı strlen fonksiyonunu gibi fonksiyonumuzun utf8 karakterlerde sorun çıkardığı.

Fonksiyonun 3. parametresi bir değer aralığı alabiliyor. Örneğin: ‘3..6’ değerini vermek ile ‘3456’ değerini vermek aynı işi yapıyor.

Birçok kullanım şekli ile strlen fonksiyonunu aşağıda inceleyelim:

Bu php sayfasının çıktısı aşağıdaki gibidir:

<pre>
str_words_count



    mixed str_word_count ( string $string [, int $format = 0 [, string $charlist ]] )
  

  

    Aldığı karakter katarının(string) kelime sayısını döndürüyor.
  

  


    Kullanımı:
    

    int(14)
  

  


    format parametresini 1 olarak ayarlayıp kelimeleri dizge olarak geri döndürebiliriz.
    

    array(14) {
[0]=>
string(2) 'Th'
[1]=>
string(4) 'poss'
[2]=>
string(3) 'ble'
[3]=>
string(5) 'value'
[4]=>
string(3) 'for'
[5]=>
string(3) 'the'
[6]=>
string(6) 'format'
[7]=>
string(3) 'and'
[8]=>
string(3) 'the'
[9]=>
string(9) 'resultant'
[10]=>
string(7) 'outputs'
[11]=>
string(3) 'are'
[12]=>
string(6) 'listed'
[13]=>
string(5) 'below'
}







    Eğer format parametresini 1 olarak ayarlayıp karakter listesi verirsek,
     fonksiyon verdiğimiz karakterleri dikkate alarak o kısımlarda kelime ayıırımı yapmaz.
    

    array(13) {
[0]=>
string(3) 'Th3'
[4]=>
string(8) 'poss1ble'
[13]=>
string(5) 'value'
[19]=>
string(3) 'for'
[23]=>
string(3) 'the'
[27]=>
string(6) 'format'
[34]=>
string(3) 'and'
[38]=>
string(3) 'the'
[42]=>
string(9) 'resultant'
[52]=>
string(7) 'outputs'
[60]=>
string(3) 'are'
[64]=>
string(6) 'listed'
[71]=>
string(5) 'below'
}





    Şimdi de format parametresini 2 olarak ayarlayıp kelimeleri gerçek indisleri ile beraber döndürelim.
    

    array(14) {
[0]=>
string(2) 'Th'
[4]=>
string(4) 'poss'
[9]=>
string(3) 'ble'
[13]=>
string(5) 'value'
[19]=>
string(3) 'for'
[23]=>
string(3) 'the'
[27]=>
string(6) 'format'
[34]=>
string(3) 'and'
[38]=>
string(3) 'the'
[42]=>
string(9) 'resultant'
[52]=>
string(7) 'outputs'
[60]=>
string(3) 'are'
[64]=>
string(6) 'listed'
[71]=>
string(5) 'below'
}




       UTF8 olmayan bir karakter katarı ile:
      

      array(17) {
[0]=>
string(1) ' '
[1]=>
string(4) 'imdi'
[2]=>
string(2) 'de'
[3]=>
string(6) 'format'
[4]=>
string(13) 'parametresini'
[5]=>
string(6) 'olarak'
[6]=>
string(8) 'ayarlay '
[7]=>
string(1) 'p'
[8]=>
string(10) 'kelimeleri'
[9]=>
string(4) 'ger '
[10]=>
string(2) 'ek'
[11]=>
string(9) 'indisleri'
[12]=>
string(3) 'ile'
[13]=>
string(7) 'beraber'
[14]=>
string(2) 'd '
[15]=>
string(3) 'nd '
[16]=>
string(5) 'relim'
}





    Charlist parametresine bir aralık verebiliriz.
    

    array(15) {
[0]=>
string(2) 'Th'
[1]=>
string(4) 'poss'
[2]=>
string(3) 'ble'
[3]=>
string(5) 'value'
[4]=>
string(3) 'for'
[5]=>
string(3) 'the'
[6]=>
string(6) 'format'
[7]=>
string(3) 'and'
[8]=>
string(3) 'the'
[9]=>
string(9) 'resul6789'
[10]=>
string(4) 'tant'
[11]=>
string(7) 'outputs'
[12]=>
string(3) 'are'
[13]=>
string(6) 'listed'
[14]=>
string(5) 'below'
}
</pre>
