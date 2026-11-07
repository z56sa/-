Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\PCD\Desktop\mode\mode"
WshShell.Run "npx electron main.cjs", 0, False
