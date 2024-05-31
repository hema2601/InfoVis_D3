

class GlobalFilter{

        include = []
        exlcude = []


        constructor(func, list_id){
                this.include = []
                this.exclude = []

                this.update = func

                this.filterList = d3.select(list_id)
        }


        addFilter(k, v, mode){

                if(mode === "inc")
                        this.include.push([k, v])
                else if(mode === "exc")
                        this.exclude.push([k, v])
               
                this.filterList.append("li")
                                .html([k, (mode === "inc")?"==":"!=", v].join(' '))


                this.update()
        }

        applyFilter(data){
                let new_data = data



                this.include.forEach((d) => {
                        if(Array.isArray(d[1])){

                                let range = Array.from({length: d[1][1] - d[1][0] + 1}, (_, i) => i + d[1][0])

                                new_data = d3.filter(new_data, (D) => range.indexOf(D[d[0]]) != -1)

                        }
                        else
                                new_data = d3.filter(new_data, (D) => D[d[0]] === d[1])
                })
                this.exclude.forEach((d) => {
                        if(Array.isArray(d[1])){
                                for(let i = d[1][0]; i < d[1][1]; i++)
                                        new_data = d3.filter(new_data, (D) => D[d[0]] != i)
                        }
                        else
                                new_data = d3.filter(new_data, (D) => D[d[0]] != d[1])
                })

                return new_data

        }

        resetFilter(){
                this.filterList.selectAll("li")
                               .remove()

                this.include = []
                this.exclude = []

                this.update()

        }

        removeFilter(){

        }

        printFilter(){
                
                console.log("Include :")
                this.include.forEach((d) => console.log(d))
                console.log("Exclude :")
                this.exclude.forEach((d) => console.log(d))
        
        }


}
