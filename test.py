import asyncio
import edge_tts

# The text we want the AI to read out loud
TEXT = "Thắng nghẹt thở Mexico, Anh sẽ gặp Na Uy ở tứ kết trên sân Hard Rock Miami, Mỹ lúc 4h ngày 12/7, giờ Hà Nội."

# Using the premium Northern Vietnamese female voice
VOICE = "vi-VN-HoaiMyNeural" 
OUTPUT_FILE = "giong_doc_vnee.mp3"

async def main():
    print(f"Connecting to Microsoft servers to synthesize voice using: {VOICE}...")
    try:
        # Initialize the communication stream
        communicate = edge_tts.Communicate(TEXT, VOICE)
        
        # Save the incoming audio chunks directly to an MP3 file
        await communicate.save(OUTPUT_FILE)
        print(f"🎉 Thành công! Audio file saved as: '{OUTPUT_FILE}'")
        print("Go ahead and play the MP3 file in your folder to hear how it sounds!")
        
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    # Run the asynchronous main function loop
    asyncio.run(main())