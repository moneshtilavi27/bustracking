import fs from 'fs-extra'

const commonFuction = {
    moveFiles(src, dest) {
        fs.pathExists(dest, (err, exists) => {
            if (!err) {
                if (exists) {
                    console.log("src===>", src);
                    console.log("dest===>", dest);
                    fs.remove(dest, err => {
                        if (err) return console.error(err)
                        console.log('removed success!');
                        commonFuction.moveFiles(src, dest);
                    })
                } else {
                    fs.move(src, dest, err => {
                        if (err) return console.error(err)
                        console.log('move success!')
                    })
                }
            }
            else {
                return false;
            }
        })
    }
}


export default commonFuction;