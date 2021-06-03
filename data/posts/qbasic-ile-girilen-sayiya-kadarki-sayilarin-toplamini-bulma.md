---
title: "QBasic ile Girilen Sayıya Kadarki Sayıların Toplamını Bulma"
slug: "qbasic-ile-girilen-sayiya-kadarki-sayilarin-toplamini-bulma"
date: "07/11/2016"
---

Quick Basic(QBasic yada QB) DOS tabanlı, BASIC dili ile programlar yazabilemizi sağlayan, Microsoft tarafından geliştirilmiş bir tümleşik geliştirme ortamıdır(IDE).

Kullandığım makinede Windows  10 yüklü olduğu için QB’yi kullanabilmek için küçük bir araştırma yaptım ve TGO’nun 64 bit versiyonunu bu linkten edindim.

Yazarken çok nostaljik anlar yaşadım keyif alarak yazdığımı söyleyebilirim. 🙂

Aşağıdaki program ile girilen sayıya kadarki sayıların her biri için birden kendisine kadarki sayıların toplama işlemi yapılır ve örnekteki formatla çıktı verilir.

Örneğin 5 değeri girdi olarak verildiyse çıktımız: “1, 1+2=3, 1+2+3=6, 1+2+3+4=10, 1+2+3+4+5=15” olmalıdır.

```basic
DIM Sayi AS INTEGER
DIM i AS INTEGER
DIM j AS INTEGER
DIM Toplam AS INTEGER

INPUT "Sayiyi girin: ", Sayi
PRINT

FOR i = 1 TO Sayi
    IF i = 1 THEN
        PRINT i; ", ";
    ELSE
        Toplam = 0
        FOR j = 1 TO i
            Toplam = Toplam + j

            IF j = i THEN
                PRINT j; "="; Toplam;
            ELSE
                PRINT j; "+";
            END IF
        NEXT j
        IF i <> Sayi THEN
            PRINT ", ";
        END IF
    END IF
NEXT i
```
