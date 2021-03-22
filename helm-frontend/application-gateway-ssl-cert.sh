# Configure your resources
appgwName="k8sApplicationGateway"
resgp="MC_DataInn_Kubernetes_RG_k8s_eastus"
vaultName="kv-k8s-cert-eac2"
mycert="wildcard-app-simplevat-com"
nameserver="simplevat-bluestreet"
subdomain="bluestreet"
helmDir="helm-frontend"
SVrelease="0.0.3-alpha-341"


versionedSecretId=$(az keyvault certificate show -n $mycert --vault-name $vaultName --query "sid" -o tsv)
unversionedSecretId=$(echo $versionedSecretId | cut -d'/' -f-5)

az network application-gateway ssl-cert create \
-n "$mycert"-cert \
--gateway-name $appgwName \
--resource-group $resgp \
--key-vault-secret-id $unversionedSecretId

az keyvault secret download -f "$mycert".pfx -n $mycert --vault-name $vaultName  -e base64

openssl pkcs12 -in "$mycert".pfx -out "$mycert"-keyfile-encrypted.key

123456
123456

openssl rsa -in "$mycert"-keyfile-encrypted.key -out "$mycert"-keyfile-decrypted.key
123456


openssl pkcs12 -in "$mycert".pfx -clcerts -nokeys -out "$mycert"-certificate.crt


kubectl create secret tls "$mycert"-tls --key="$mycert-keyfile-decrypted.key" --cert="$mycert-certificate.crt" -n $nameserver

rm "$mycert".pfx
rm "$mycert"-keyfile-encrypted.key
rm "$mycert"-keyfile-decrypted.key
rm "$mycert"-certificate.crt

helm install $nameserver-frontend ./$helmDir --values ./$helmDir/values-"$subdomain".yaml --set simpleVatFrontendRelease=$SVrelease --set image.repository.frontend.tag=$SVrelease -n $nameserver --dry-run --debug

az network application-gateway ssl-cert list --gateway-name $appgwName --resource-group $resgp

appgwName="k8sApplicationGateway"
resgp="MC_DataInn_Kubernetes_RG_k8s_eastus"
vaultName="kv-k8s-cert-eac2"
mycert="wildcard-test-simplevat-com"
nameserver="simplevat-test2"
subdomain="test2"
helmDir="helm-simplevat"
SVrelease="0.0.3-alpha-138"

helm upgrade $nameserver-frontend ./$helmDir --values ./$helmDir/values-"$subdomain".yaml --set simpleVatFrontendRelease=$SVrelease --set image.repository.frontend.tag=$SVrelease -n $nameserver --dry-run --debug



nameserver="simplevat-demo"
subdomain="demo"
helmDir="helm-frontend"
SVrelease="0.0.3-alpha-233"

helm install $nameserver-frontend ./$helmDir --values ./$helmDir/values-"$subdomain".yaml --set simpleVatFrontendRelease=$SVrelease --set image.repository.frontend.tag=$SVrelease -n $nameserver --dry-run --debug
