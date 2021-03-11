const inquirer = require('inquirer');
const elegantSpinner = require('elegant-spinner');
const logUpdate = require('log-update');
const progress = require('request-progress');
const request = require('request'); 
const fs = require('fs');
const cheerio = require('cheerio'); 




var questions = [
    {
        //Remove '/catogory/' if there is in the link and change it to '/'
        type:'input',
        name:'link',
        message:'Paste the html here : ',
    }]


//Getting answers
inquirer.prompt(questions).then((answers) => {
    scrapper(answers.link)
});


let imgs = []

//Coversion logic
const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

function niceBytes(x){

    let l = 0, n = parseInt(x, 10) || 0;

    while(n >= 1024 && ++l){
        n = n/1024;
    }
    //include a decimal point and a tenths-place digit if presenting 
    //less than ten of KB or greater units
    return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + units[l]);
}

let download = (link,fileName,folderName)=>{
    let TotalSize;
    return new Promise((resolve, reject) => {
        const frame = elegantSpinner();
        progress(request(link), {}).on('progress', function (e) {
            TotalSize = e.size.total
            let percentage = Math.floor((e.size.transferred/e.size.total)*100) + 1;
            let rep = [
                '>          ',
                '=>         ',
                '==>        ',
                '===>       ',
                '====>      ',
                '=====>     ',
                '======>    ',
                '=======>   ',
                '========>  ',
                '=========> ',
                '==========>',
            ]
            var mind = e.time.remaining % (60 * 60);
            var minutes = Math.floor(mind / 60);
            var secd = mind % 60;
            let kbs = Math.floor((e.speed/1000))>1000 ? Math.floor((e.speed/1000000))+'MB/s' : Math.floor((e.speed/1000))+'KB/s'  
            let size = niceBytes(e.size.transferred) 
            var seconds = Math.ceil(secd);
            logUpdate(fileName+'  '+frame()+'     '+percentage+'%['+rep[Math.floor(percentage/10)]+']',size+'   '+kbs+'    '+'eta',minutes+' min '+seconds+' sec');
        })
            .on('error', function (err) {
                logUpdate(`${fileName} ⠸⠸    100%[xxxxxxxxxxx]    Error.`);
                fs.unlinkSync(fileName)
                resolve("")
            })
            .on('end', function () {
                logUpdate(`${fileName} ⠸⠸    100%[==========>] ${niceBytes(TotalSize)}   Completed.`);
                resolve("")
            }).pipe(fs.createWriteStream("./"+folderName+"/"+fileName));
    })
}


let scrapper = async (src)=>{
    var fs = require('fs');
    //fs.unlinkSync("manga",{ recursive: true })
    try{
        fs.rmdirSync('manga',{ recursive: true });
    }catch{
        console.log("Yes")
    }
    fs.mkdirSync('manga');

    let $ = cheerio.load(src);
    for(i=0;i<$('img').length;i++){
        //let downloaded = await download($('img')[i].attribs.src,($('img').length - i)+'.jpg',"manga")
        let downloaded = await download($('img')[i].attribs.src,i+'.jpg',"manga")
        console.log(downloaded)
    }
}



