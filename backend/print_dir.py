from deepgram import DeepgramClient

client = DeepgramClient("fake")
print("LISTEN:", [x for x in dir(client.listen) if not x.startswith("_")])
print("LIVE:", [x for x in dir(client.listen.live) if not x.startswith("_")])
