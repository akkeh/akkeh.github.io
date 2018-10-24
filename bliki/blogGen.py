#! /bin/python
import os, sys

def genRoll(title, menu, contentDir):
    docstr = '<!DOCTYPE html>\n'
    # <html>
    # <head>
    head = '\t<link rel="stylesheet" type="text/css" href="style.css">\n\t<title>' + title + '</title>\n'
    # </head>
    # <body>
    hdr = '\t<header>\n\t\t<h1>/blog</h1>\n\t</header>'
    nav = '\t<nav>\n\t\t<ul>\n'
    for name, link in menu:
        nav = nav + '\t\t\t<li><a href="' + link + '">' + name + '</a></li>\n'
    nav = nav + '\t\t</ul>\n\t</nav>\n'
    # <main>
    d = os.listdir(contentDir)
    cDict = {};
    for fn in d:
        date = fn
        if date in cDict.keys():
            print('error: double file')
        else:
            with open(contentDir+fn, 'r') as f:
                lines = f.readlines();
                cDict[date] = lines[0];
                for line in lines[1:]:
                    cDict[date] = cDict[date] + line;
    content = '';
    for k in sorted(cDict.keys())[::-1]:
        content += cDict[k] + '\n<hr>\n';
    # </main>       
    # </body>
    # </html>
    return docstr + '<html>\n' + '<head>\n' + head + '</head>\n' + '<body>\n' + hdr + '\n' + nav + '\n' + '<main>\n' + content + '</main>\n</body>\n</html>'



title = 'Bliki'
menu = [ ('home', 'index.html'),
        ('projects', 'proj.html'),
        ('links', 'links.html'),
        ('CV', 'docs/cv_amhouben.pdf')
];

print(genRoll(title, menu, './content/'))
