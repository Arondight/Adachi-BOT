#coding:utf-8
import re
import json

data = []
trigger = []
text = []
audio_url = []

with open("scraping.html","r") as f:
	for line in f:
		data.append(line)

triggerReg = re.compile(r'<td colspan=5 style="color: #e5c302">[^A-Za-z？].*</td>')
textReg = re.compile(r'<td colspan=5>[^？].*</td>')
audio_urlReg = re.compile(r'<div class=audio_cont data-audio=quotes/keqing/.*cn></div>')

for line in data:
	if re.search(triggerReg,str(line)) is not None:
		line = line.strip()
		line = re.sub(r'(<td colspan=5 style="color: #e5c302">)|(</td>)','',line)
		trigger.append(line)

for line in data:
	if re.search(textReg, str(line)) is not None:
		 line = line.strip()
		 line = re.sub(r'(<td colspan=5>)|(</td>)','',line)
		 text.append(line)

for line in data:
	if re.search(audio_urlReg, str(line)) is not None:
		line = line.strip()
		line = re.sub(r'(<div class=audio_cont data-audio=quotes/keqing/)|(></div>)','',line)
		line = "https://genshin.honeyhunterworld.com/audio/quotes/keqing/" + line + ".wav"
		audio_url.append(line)

trigger.reverse()
text.reverse()
audio_url.reverse()

# print(len(trigger))
# print(trigger)
# print(len(text))
# print(text)
# print(audio_url)
# print(len(audio_url))

combined_list = []
for a,b in zip(trigger,text):
	combined_list.append(str(a) + ":" + str(b))

print(combined_list)