class NormBarChart{

        colorScheme = ["#67001f","#6a011f","#6d0220","#700320","#730421","#760521","#790622","#7b0722","#7e0823","#810923","#840a24","#870b24","#8a0c25","#8c0d26","#8f0f26","#921027","#941127","#971228","#9a1429","#9c1529","#9f172a","#a1182b","#a41a2c","#a61c2d","#a81d2d","#aa1f2e","#ad212f","#af2330","#b12531","#b32732","#b52933","#b72b34","#b82e35","#ba3036","#bc3238","#be3539","#bf373a","#c13a3b","#c33c3d","#c43f3e","#c6413f","#c74441","#c94742","#ca4943","#cc4c45","#cd4f46","#ce5248","#d0544a","#d1574b","#d25a4d","#d45d4e","#d56050","#d66252","#d86554","#d96855","#da6b57","#db6d59","#dd705b","#de735d","#df755f","#e07861","#e17b63","#e27d65","#e48067","#e58369","#e6856b","#e7886d","#e88b6f","#e98d71","#ea9073","#eb9276","#ec9578","#ed977a","#ee9a7c","#ee9c7f","#ef9f81","#f0a183","#f1a486","#f2a688","#f2a88b","#f3ab8d","#f4ad90","#f4af92","#f5b295","#f5b497","#f6b69a","#f6b89c","#f7ba9f","#f7bda1","#f8bfa4","#f8c1a6","#f8c3a9","#f9c5ab","#f9c7ae","#f9c9b0","#facab3","#faccb5","#faceb8","#fad0ba","#fad2bc","#fad3bf","#fad5c1","#fbd7c4","#fbd8c6","#fbdac8","#fbdbca","#fbddcc","#fadecf","#fae0d1","#fae1d3","#fae2d5","#fae3d7","#fae5d8","#fae6da","#f9e7dc","#f9e8de","#f9e9e0","#f8eae1","#f8eae3","#f7ebe4","#f7ece6","#f6ede7","#f6ede8","#f5eee9","#f4eeeb","#f4efec","#f3efed","#f2efed","#f1efee","#f0f0ef","#eff0f0","#eef0f0","#edf0f1","#eceff1","#ebeff1","#eaeff2","#e9eff2","#e7eef2","#e6eef2","#e5edf2","#e3edf2","#e2ecf2","#e0ecf2","#dfebf2","#ddeaf2","#dbeaf1","#dae9f1","#d8e8f1","#d6e7f0","#d4e6f0","#d3e6f0","#d1e5ef","#cfe4ef","#cde3ee","#cbe2ee","#c9e1ed","#c7e0ed","#c5dfec","#c2ddec","#c0dceb","#bedbea","#bcdaea","#bad9e9","#b7d8e8","#b5d7e8","#b2d5e7","#b0d4e6","#aed3e6","#abd1e5","#a9d0e4","#a6cfe3","#a3cde3","#a1cce2","#9ecae1","#9cc9e0","#99c7e0","#96c6df","#93c4de","#91c3dd","#8ec1dc","#8bc0db","#88beda","#85bcd9","#83bbd8","#80b9d7","#7db7d7","#7ab5d6","#77b3d5","#74b2d4","#71b0d3","#6faed2","#6cacd1","#69aad0","#66a8cf","#64a7ce","#61a5cd","#5ea3cc","#5ba1cb","#599fca","#569dc9","#549bc8","#5199c7","#4f98c6","#4d96c5","#4b94c4","#4892c3","#4690c2","#448ec1","#428cc0","#408bbf","#3e89be","#3d87bd","#3b85bc","#3983bb","#3781ba","#3680b9","#347eb7","#337cb6","#317ab5","#3078b4","#2e76b2","#2d75b1","#2c73b0","#2a71ae","#296fad","#286dab","#266baa","#2569a8","#2467a6","#2365a4","#2164a2","#2062a0","#1f609e","#1e5e9c","#1d5c9a","#1b5a98","#1a5895","#195693","#185490","#17528e","#164f8b","#154d89","#134b86","#124983","#114781","#10457e","#0f437b","#0e4178","#0d3f75","#0c3d73","#0a3b70","#09386d","#08366a","#073467","#063264","#053061"];

        margin = {
                top: 10, right: 100, bottom: 40, left: 40
        }

        tooltip_size = 0//100;

        constructor(svg, data, width = 250, height = 250, margin, filter){

                this.svg = svg;
                this.data = data;
                this.width = width;
                this.height = height;
                this.margin = margin

                this.glFilter = filter

        }

        initialize(comps, domain, order){

                this.container = this.svg.append("g");
                this.xAxis = this.svg.append("g");
                this.yAxis = this.svg.append("g");
                this.legend = this.svg.append("g");
                this.tooltip = this.svg.append("g")
                                        .style("display", "none")


                this.comps = comps
                this.domain = domain
                this.order = order
                

                let mod = Math.floor(this.colorScheme.length / this.domain.length)

                this.colorScheme = this.colorScheme.filter((n, idx) => idx > Math.floor(mod/2) && idx < this.colorScheme.length - Math.floor(mod/2))
                this.colorScheme = this.colorScheme.filter((n, idx) => (idx % mod) === 0)


                this.xScale = d3.scaleLinear().range([0, this.width]);
                this.yScale = d3.scaleBand().range([this.height, 0]).paddingInner(0.2).paddingOuter(0.2)

                let lower = this.domain[0]
                let upper = this.domain[this.domain.length - 1]


                this.zScale = d3.scaleOrdinal().domain(this.domain).range(this.colorScheme)

                this.svg
                        .attr("width", this.width + this.margin.left + this.margin.right)
                        .attr("height", this.height + this.margin.top + this.margin.bottom);

                this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);


        }

        update(comps, sorting = "net-neg"){

                this.container.selectAll("*").remove()

                //console.log("BarChart with Filter :")
                //this.glFilter.printFilter()

                let data = this.glFilter.applyFilter(this.data)

                //console.log(data)

                if(comps != undefined)
                        this.comps = comps

                //console.log(this.comps)




                // TODO: read whether the #use-color checkbox has been checked or not (boolean)
                let useColor = true;


                this.processed_data = {};
                

                this.comps.forEach(c => {
                        let count = d3.count(d3.filter(data, (d) => this.domain.indexOf(d[c]) != -1), (d) => d[c])
                        //create Data
                         this.processed_data[c] = {}
                         this.processed_data[c]["count"] = count 
                        let test = d3.flatRollup(d3.filter(data, (d) => this.domain.indexOf(d[c]) != -1), (D) => D.length, (d) => d[c])
                         //console.log(test)
                        // fill in 0s
                        if(test.length != this.domain.length){
                                this.domain.forEach((d) =>{
                                        let exist = 0
                                        test.forEach((D) => {
                                                if(D[0] === d)
                                                       exist = 1;
                                        })
                                        if(exist === 0)
                                                test.push([d, 0])
                                })

                        }
                

                        if(this.order === "desc")
                                test = d3.map(d3.sort(test, (a, b) => b[0] - a[0]), (d) => d[1])
                        else if(this.order === "asc")
                                test = d3.map(d3.sort(test, (a, b) => a[0] - b[0]), (d) => d[1])

                        //console.log(test)
                        let a = d3.cumsum(test)
                        let b = new Float64Array([0])

                        test = new Float64Array(a.length + b.length)
                        test.set(b)
                        test.set(a, b.length)

                        //console.log(test)
                         this.processed_data[c]["start"] = test;
                         this.processed_data[c]["finish"] = a.map((num, idx) => num - test[idx]);




                })

                //console.log(processed_data)



                //Sort comps based on requested sorting type

                if(sorting == "net-pos"){

                        let pos_range = []
                        this.domain.forEach((d, idx) => {
                                if(idx >= (this.domain.length - this.domain.length / 2) )
                                        pos_range.push(idx)
                        })

                        this.comps = this.comps.sort( (a, b) => (( this.processed_data[a].count -  this.processed_data[a].start[pos_range[0]] )- ( this.processed_data[b].count -  this.processed_data[b].start[pos_range[0]])))

                } else if(sorting == "net-neg"){

                        let neg_range = []
                        this.domain.forEach((d, idx) => {
                                if(idx < Math.floor(this.domain.length / 2) )
                                        neg_range.push(idx)
                        })

                        //console.log(neg_range.slice(-1))

                        this.comps = this.comps.sort((a, b) => (( this.processed_data[a].start[neg_range.slice(-1)[0] + 1] )- ( this.processed_data[b].start[neg_range.slice(-1)[0] + 1])))

                } else if(sorting == "ext-neg"){

                        this.comps = this.comps.sort((a, b) => ((this.processed_data[a].start[1])- ( this.processed_data[b].start[1])))

                } else if(sorting == "ext-pos"){
                        
                        let idx = this.domain.length - 1 

                        this.comps = this.comps.sort( (a, b) => (( this.processed_data[a].finish[idx])- ( this.processed_data[b].finish[idx])))

                }


        
                this.yScale = this.yScale.domain(this.comps)

                //console.log(this.domain)

                //this.domain.forEach(d => console.log(d, this.zScale(d)))





                this.comps.forEach(c => {
                        this.container.append("g")
                                .selectAll("rect")
                                .data(this.domain)
                                .join("rect")
                                .on("mouseover", (event, d) => { this.mouseoverEvent(event, d, c) })
                                .on("mouseout", (event) => { this.mouseoutEvent(event, c) })
                                .on("mousemove", (event) => { this.mousemoveEvent(event, c) })
                                .on("mousedown", (event, d) => { this.mousedownEvent(event, d, c) })
                                .transition()
                                .attr("x", (d, idx) => this.xScale( this.processed_data[c]["start"][idx] /  this.processed_data[c]["count"]))
                                .attr("y", d => this.yScale(c))// + this.yScale.bandwidth() * 1/3 )
                                .attr("fill", d => useColor ? this.zScale( d) : 'black')
                                .attr("width", (d, idx) => this.xScale( this.processed_data[c]["finish"][idx] /  this.processed_data[c]["count"]))
                                .attr("height", this.yScale.bandwidth())// * 1/3)
                })

                this.xAxis
                        .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
                        .transition()
                        .call(d3.axisBottom(this.xScale));

                this.yAxis
                        .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
                        .transition()
                        .call(d3.axisLeft(this.yScale));


                this.legend
                        .attr("transform", `translate(${this.width + this.margin.left + 10}, ${this.margin.top})`)

                        .style("display", "inline")
                        .call(d3.legendColor().scale(this.zScale));
                

                //create tooltip
                this.tooltip.append("rect")
                            .attr("fill", "white")
                            .attr("stroke", "black")
                            .attr("height", this.tooltip_size)
                            .attr("width", this.tooltip_size)



        }


        mouseoverEvent(event, d, c){

                //Make Tooltip visible
                this.tooltip.style("display", null)
                
                //Mark target as hovered
                let target = d3.select(event.target)
                target.classed("hovered", true)

               
                //process the data for display
                let width = this.xScale.invert(target.attr("width"))
                let count =Math.round(width * this.processed_data[c]["count"]) 
                let total_count = this.processed_data[c]["count"]
                let percentage = Math.round(width * 10000) / 100

                
                this.tooltip.append("path")


                let text = [[c, "-", d].join(' '), [count , "(", percentage, "%) out of ", total_count].join(' ')]
                
                let txt = this.tooltip.append("text")
                                .selectAll("tspan")
                                .data(text)
                                .join("tspan")
                                .text((d) => d)
                                .attr("font-size", "0.8em")
                                .attr("font-weight", (d, idx) => idx ? "" : "bold")
                                .attr("y", (d, idx) => `${(idx+1) * 0.8}em`)
                                .attr("x", 0)

                let path = d3.path()
                
                let group = this.tooltip.node().getBoundingClientRect();

                //console.log(group)

                path.rect(-5, -5, group.width + 10, group.height + 5)

                this.tooltip.select("path")
                                .attr("d", path.toString())
                                .attr("stroke", "black")
                                .attr("fill", "white")


                this.mousemoveEvent(event, c)
        }
        mouseoutEvent(event, c){
                let target = d3.select(event.target)

                target.classed("hovered", false)
                this.tooltip.style("display", "none")
                this.tooltip.selectAll("text").remove()
                this.tooltip.selectAll("path").remove()
        }


        mousemoveEvent(event, c){

                let tt = this.tooltip.node().getBoundingClientRect();
                let graph = this.container.node().getBoundingClientRect();


                let add_x =  this.margin.right
                let add_y = this.margin.top
                let mouse_pos = [event.pageX - graph.x , event.pageY - graph.y]

                let offset = 20;

                let x = mouse_pos[0] + offset
                let y = mouse_pos[1] + offset



                if(mouse_pos[0] + tt.width + offset >= graph.width )
                       x = mouse_pos[0] - offset - tt.width


                if(mouse_pos[1] + tt.height + offset >= graph.height )
                        y = mouse_pos[1] - offset - tt.height

               x += add_x
               y += add_y

                this.tooltip.attr("transform", `translate(${x}, ${y})`)
                /*
                let rect = this.svg.node().getBoundingClientRect();
                let tt = this.tooltip.node().getBoundingClientRect();
                if(event.pageY - rect.y + 20 + this.tooltip_size < this.width && event.pageX - rect.x + 20 < this.height){         
                        this.tooltip.attr("transform", `translate(${event.pageX - rect.x + 20}, ${event.pageY - rect.y + 20})`)
               } else if(event.pageX - rect.x + 20 >= this.height && event.pageY - rect.y + 20 + this.tooltip_size >= this.width)  {
                        this.tooltip.attr("transform", `translate(${event.pageX - rect.x - 20 - tt.width}, ${event.pageY - rect.y + 20})`)
               } else if(event.pageY - rect.y + 20 + this.tooltip_size >= this.width)
                        this.tooltip.attr("transform", `translate(${event.pageX - rect.x + 20}, ${event.pageY - rect.y - 20 - 1/2 * this.tooltip_size})`)
                else
                        this.tooltip.attr("transform", `translate(${event.pageX - rect.x - 20 - tt.width}, ${event.pageY - rect.y - 20 - 1/2 * this.tooltip_size})`)
        */}
        

        mousedownEvent(event, d, c){
                
                includeSelect.addItems([[c, d]])
                excludeSelect.addItems([[c, d]])
                
                includeSelect.display(event.target)
                excludeSelect.display(event.target)

        }
        




}
