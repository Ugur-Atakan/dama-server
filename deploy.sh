#!/bin/bash

APP_NAME="dama-server"
BUILD_FILE="dist/main.js"

echo "🚀 Deploy süreci başlatılıyor..."

# 1. Git'ten en son kodları çek
echo "📦 Yeni kodlar çekiliyor..."
git pull

# 2. Bağımlılıkları yükle
echo "📦 Bağımlılıklar yükleniyor..."
yarn install --frozen-lockfile

# 3. Prisma Generate Çalıştır
echo "🔄 Prisma şemaları oluşturuluyor..."
npx prisma generate

# 4. Build al
echo "🛠️ Proje derleniyor..."
yarn build

# 5. PM2 işlemlerini yönet
echo "🔄 PM2 uygulaması güncelleniyor..."

# Eğer uygulama zaten çalışıyorsa restart, yoksa yeni başlat
if pm2 list | grep -q $APP_NAME; then
  echo "♻️ PM2 uygulaması yeniden başlatılıyor..."
  pm2 restart $APP_NAME
else
  echo "🚀 PM2 uygulaması başlatılıyor..."
  pm2 start $BUILD_FILE --name $APP_NAME --watch
fi

# 6. PM2 sürecini kalıcı hale getir
pm2 save

echo "✅ Deploy tamamlandı!"
