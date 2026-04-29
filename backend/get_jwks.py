import urllib.request, json
from jose import jwk

url = "https://outgoing-camel-73.clerk.accounts.dev/.well-known/jwks.json"
resp = urllib.request.urlopen(url)
keys = json.loads(resp.read())['keys']
key = jwk.construct(keys[0])
pem = key.to_pem().decode('utf-8')
print(pem)
