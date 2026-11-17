Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "C:\Users\User\OneDrive\Desktop\Akses HP Online (4G-5G).lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "C:\Users\User\OneDrive\Desktop\Akses HP Online (4G-5G).bat"
oLink.WorkingDirectory = "c:\Users\User\OneDrive\Documents\INOVASI SIVAKSIN\SIVAKSIN"
oLink.Description = "Akses HP Online SIVAKSIN (4G/5G Bebas Wi-Fi)"
oLink.IconLocation = "c:\Users\User\OneDrive\Documents\INOVASI SIVAKSIN\SIVAKSIN\sivaksin.ico,0"
oLink.Save
