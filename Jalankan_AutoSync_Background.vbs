' Auto-Start SIVAKSIN Server (Port 3003) & Auto-Sync 2-Arah GitHub (Background / Tanpa Popup)
Option Explicit

Dim WshShell, fso, projectDir, nodeExe, isRunning, i

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

projectDir = fso.GetParentFolderName(WScript.ScriptFullName)
nodeExe = "C:\Program Files\nodejs\node.exe"
If Not fso.FileExists(nodeExe) Then
    nodeExe = "node"
Else
    nodeExe = """" & nodeExe & """"
End If

Function CheckPort3003()
    On Error Resume Next
    Dim req
    Set req = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    req.open "GET", "http://127.0.0.1:3003/api/status", False
    req.setTimeouts 800, 800, 800, 800
    req.send
    If Err.Number = 0 And (req.status >= 200 And req.status < 500) Then
        CheckPort3003 = True
    Else
        CheckPort3003 = False
    End If
    On Error GoTo 0
End Function

WshShell.CurrentDirectory = projectDir

' 1. Jalankan Auto-Sync GitHub 2-Arah Watcher di background (otomatis menolak duplikat via lock)
WshShell.Run nodeExe & " scripts\sync-github.js --watch", 0, False

' 2. Pastikan server lokal SIVAKSIN Port 3003 aktif di background
isRunning = CheckPort3003()
If Not isRunning Then
    WshShell.Run nodeExe & " server.js", 0, False
    For i = 1 To 20
        WScript.Sleep 500
        If CheckPort3003() Then Exit For
    Next
End If
