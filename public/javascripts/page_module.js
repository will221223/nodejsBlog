let pageModule = function( resourceData , currentPage , category = ''){

        // 做分頁邏輯
        const totalResult = resourceData.length; //總文章數量
        const perpage = 3 //每頁三筆文章
        const pageTotal = Math.ceil(totalResult / perpage) //總頁數
        // let currentPage = 3 // 當前頁數
        if (currentPage > pageTotal){
        currentPage = pageTotal //當前頁數不得>頁數
        }

        const minItem = (currentPage * perpage) - perpage + 1
        const maxItem = (currentPage * perpage)
        const data = [];
        resourceData.forEach(function(item,i){
        let itemNum = i +1;
        if(itemNum >= minItem && itemNum <= maxItem){
            data.push(item)
        }
        })

        const page = {
        pageTotal,
        currentPage,
        hasPre : currentPage >1,
        hasNext : currentPage <pageTotal,
        category
        }
        return{
            page,
            data
        }
}

module.exports = pageModule;