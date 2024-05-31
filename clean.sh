rm -rf node_modules
rm -rf .next
for p in api chains cli client mail nonce store validators web
do
  rm -rf packages/$p/node_modules
done
