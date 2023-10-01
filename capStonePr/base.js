const express = require('express')
const mysql = require('mysql')
const path = require('path')
const static = require('serve-static')
const dbconfig = require('./config/dbconfig.json')

const pool = mysql.createPool(dbconfig)
const app = express()
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use('/view', static(path.join(__dirname, 'view')));
app.use('/api', static(path.join(__dirname, 'api')));
app.use('/style', static(path.join(__dirname, 'style')));

app.post('/api/login', (req, res)=>{
    console.log('/api/login' + req)
    const paramId = req.body.id;
    const paramPwd = req.body.password; 

    console.log('로그인 요청'+paramId+' '+paramPwd);
    pool.getConnection((err,conn)=>{
        if(err){
            conn.release();
            console.log('mysql getConnection error.');
            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'});
            res.write('<h2>db connect failed</h2>');
            res.end();
            return;
        }

        const exec = conn.query('select `userId`, `userName` from `users` where `userId`=? and `userPwd`=password(?)',
            [paramId,paramPwd],
            (err, rows)=>{
                conn.release();
                console.log('실행된 SQL query: '+exec.sql);

                if(err){
                    console.dir(err);
                    res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
                    res.write('<h2>query execute failed</h2>')
                    res.end();
                    return;
                }
                if (rows.length>0){
                    console.log('아이디 [%s], 패스워드가 일치하는 사용자[%s] 찾음',paramId,rows[0].name);
                    res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
                    res.write('<h2>로그인 성공</h2>')
                    res.end();s
                    return;
                }
                else{
                    console.log('아이디 [%s], 패스워드가 일치 없음',paramId);
                    res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
                    res.write('<h2>로그인 실패 아이디와 비밀번호를 확인하세요.</h2>')
                    res.end();
                    return;
                }
            }
        )
    })

});

app.post('/api/addUser', (req, res)=>{
    console.log('/api/addUser' + req)

    const paramId = req.body.id;
    const paramPwd = req.body.password;
    const paramName = req.body.name;
    const paramNickname = req.body.nickname;

    pool.getConnection((err, conn)=> {
        if(err){
            conn.release();
            console.log('mysql getConnection error.');
            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'});
            res.write('<h2>db connect failed</h2>');
            res.end();
            return;
        }
        console.log('mysql getConnection success.');

        const exec = conn.query('insert into users (userId, userName, nickName, userPwd, regDate) values (?,?,?,password(?),now())',
                    [paramId, paramName, paramNickname, paramPwd],
                    (err, result)=>{
                        conn.release();
                        console.log('sql:'+ exec.sql)

                        if(err){
                            console.log('error');
                            console.dir(err);
                            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
                            res.write('<h2>query execute failed</h2>')
                            res.end();
                            return;
                        }

                        if(result){
                            console.dir(result);
                            console.log('insert success');

                            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
                            res.write('<h2>사용자 추가 성공</h2>')
                            res.end();
                        }else{
                            console.log('insert failed');

                            res.writeHead('200', {'Content-Type':'text/html; charset=utf8'})
                            res.write('<h2>사용자 추가 실패</h2>')
                            res.end();
                        }
                    })
    })
});

app.listen(3000, ()=>{
    console.log('listening on port 3000');
})