#! /bin/python
import os, sys
import datetime

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
        date = fn.split('_')[0];
        if date in cDict.keys():
            print('error: double file')
            break;
        try:
            int(date)
            with open(contentDir+fn, 'r') as f:
                lines = f.readlines();
                cDict[date] = lines[0];
                for line in lines[1:]:
                    cDict[date] = cDict[date] + line;
        except:
            pass;

    content = '';
    for k in sorted(cDict.keys())[::-1]:
        content += cDict[k] + '\n<hr>\n';
    # </main>       
    # </body>
    # </html>
    return docstr + '<html>\n' + '<head>\n' + head + '</head>\n' + '<body>\n' + hdr + '\n' + nav + '\n' + '<main>\n' + content + '</main>\n</body>\n</html>'

def genWiki(title, menu, contentDir='./content/', blogDir='../blog/'):
    # list content:
    d = os.listdir(contentDir)
    cont = {};
    for fn in d:
        titl = fn;
        if titl in cont.keys():
            print('error: double file')
            break;
        with open(contentDir+fn, 'r') as f:
            lines = f.readlines();
            if len(lines) > 0:
                if lines[0] == '!WIKI\n':
                    cont[titl] = {'title': lines[1]};
                    if(lines[2].find('keywords:') == 0):
                        cont[titl]['keywords'] = lines[2][10:].split(' ');
                    cont[titl]['content'] = '';
                    for line in lines[3:-1]:
                        cont[titl]['content'] = cont[titl]['content'] + line;
                    cont[titl]['history'] = lines[-1];
                    cont[titl]['T'] = getModT(contentDir+fn);
                    cont[titl]['raw'] = lines;
                else:
                    pass
    # generate pages:
    for article in cont.keys():
        with open(blogDir+article, 'w') as f:
            pass;
        
        # write update info:
        if cont[article]['history'].split(' ')[-1][:-1] != cont[article]['T']:
            print(cont[article]['history'].split(' ')[-1])
            with open(contentDir+article, 'w') as f:
                lines = cont[article]['raw']
                lines[-1] = lines[-1] + ' ' + cont[article]['T']
                f.writelines(lines)

    # generate main page:
   
def getModT(fn):
    t = datetime.datetime.utcfromtimestamp(os.path.getmtime(fn))
    yyyy = str(t.year)
    mm = str(t.month)
    if len(mm) == 1:
        mm = '0'+mm;
    dd = str(t.day)
    if len(dd) == 1:
        dd = '0'+dd;
    return yyyy + mm + dd 

def genWikiiPage(title, menu, content):
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


