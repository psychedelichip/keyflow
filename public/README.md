# Public Folder

Bu klasöre ses dosyalarınızı ekleyebilirsiniz:

## Müzik Dosyası

Lo-fi müzik için bir MP3 dosyası ekleyin ve `hooks/useBackgroundMusic.ts` dosyasındaki `defaultMusicUrl` değerini güncelleyin.

Örnek:
```typescript
const defaultMusicUrl = '/lofi-music.mp3';
```

## Klavye Sesi

Mekanik klavye sesi şu anda Web Audio API ile programatik olarak oluşturuluyor. Eğer gerçek ses dosyası kullanmak isterseniz, `hooks/useKeyboardSound.ts` dosyasını güncelleyebilirsiniz.


