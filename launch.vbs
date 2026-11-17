' SIVAKSIN Launcher - RSUD Al-Mulk
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
projectDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = projectDir

' 1. Pastikan background Auto-Sync GitHub 2-arah & server port 3003 aktif
WshShell.Run "wscript.exe """ & fso.BuildPath(projectDir, "Jalankan_AutoSync_Background.vbs") & """", 0, False

' 2. Tunggu sebentar jika server baru dinyalakan lalu buka browser
Dim i, ready
ready = False
For i = 1 To 30
    On Error Resume Next
    Set httpPoll = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    httpPoll.open "GET", "http://127.0.0.1:3003/api/status", False
    httpPoll.setTimeouts 500, 500, 500, 500
    httpPoll.send
    If Err.Number = 0 And (httpPoll.status >= 200 And httpPoll.status < 500) Then
        ready = True
        Exit For
    End If
    On Error GoTo 0
    WScript.Sleep 500
Next

' 3. Buka aplikasi di default browser
WshShell.Run "http://localhost:3003", 1, False
