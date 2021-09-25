import json
import random

with open("keqing.json",'r') as f:
	file = f.read()

dictionary = json.loads(file)

order = []
for key in dictionary:
	order.append(str(key) + "：" + str(dictionary[key][0]["text"]))

print(order)