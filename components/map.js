class PoliticalMap{

        parties = ["CDU", "SPD", "The Left", "The Greens", "FDP", "AfD", "Pirate Party", "NPD", "Other"]

        colors = ["#151518 ", "#E3000F ", "#BE3075 ", "#409A3C ", "#FFED00 ", "#009DE0 ", "Orange", "#8B4726 ", "darkgrey", "purple"]

        states = ["DE1", "DE2", "DE3", "DE4", "DE5", "DE6", "DE7", "DE8", "DE9", "DEA", "DEB", "DEC", "DED", "DEE", "DEF", "DEG"]

        margin = {
        
                top: 10, right: 100, bottom: 40, left: 40
        }

        tooltip_size = 0;
        
        constructor(svg, data, width = 250, height = 250, margin, filter){

                this.svg = svg;
                this.data = data;
                this.width = width;
                this.height = height;
                this.margin = margin

                this.glFilter = filter

        }


        initialize(){

                this.container = this.svg.append("g");
                this.xAxis = this.svg.append("g");
                this.yAxis = this.svg.append("g");
                this.legend = this.svg.append("g");
                this.tooltip = this.svg.append("g")
                                       .style("display", "none")
                

                //console.log(this.state_data)

                let latitudeGer = 51;
                let longitudeGer = 9;

                d3.json("https://gist.githubusercontent.com/hema2601/f8b280bd155bc8bcaba20357966469a9/raw/f7ac2e9b8398d568704b76eed99e6ce4f7db4107/GermanyGeoJSON.json").then((d) => {
                        let projection = d3.geoMercator()
                                .center([longitudeGer, latitudeGer])
                                .scale(1800)
                                .translate([this.width/2 - 40 , this.height/2])

                        this.pathGenerator = d3.geoPath().projection(projection)
                        this.map_data = d
                  //      console.log("Done")

                })
                                              .catch(error => console.error(error))


                




                this.xScale = d3.scaleLinear().range([0, this.width]);
                this.yScale = d3.scaleLinear().range([this.height, 0])
                this.zScale = d3.scaleOrdinal().domain(this.parties).range(this.colors)

                this.svg
                        .attr("width", this.width + this.margin.left + this.margin.right)
                        .attr("height", this.height + this.margin.top + this.margin.bottom);

                this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
                                

        }

        update(target = "prtvede2", displayType){
                
                //Wait for data to load
                if(this.map_data === undefined){
                        setTimeout(this.update, 50);
                        return
                }

                //clear the map
                this.container.selectAll("*").remove()
                
                //console.log("Map with Filter :")
                //this.glFilter.printFilter()
                
                let data = this.glFilter.applyFilter(this.data)

                //console.log(data)


                this.state_data = []
                let counts = []
                this.states.forEach((D) => {
                        
                        //separate data by state
                        let tmp = d3.filter(data, (d) => d["region"] === D)
                        this.state_data.push(tmp)

                        //count the occurences of each party for the specified target
                        let newCount = []
                        this.parties.forEach((p, idx) => {
                                newCount.push(d3.count(tmp.filter(D => D[target] === idx+1), d => d[target]))
                        
                        })
                        if(target == "prtvede2"){
                                newCount.push(d3.count(tmp.filter(D => D["vote"] === 2), d => d["vote"]))

                        }
                                counts.push(newCount);
                })

               //console.log("Counts : ", counts)

                this.container.attr("width", this.width)
                        .attr("height", this.height)

               //Create Color scale according to  
                if(displayType === "11"|| displayType === "12" ){
                        if(target == "prtvede2")
                                this.zScale = d3.scaleOrdinal().domain(this.parties.concat( ["Non-Voters"])).range(this.colors)
                        else
                                this.zScale = d3.scaleOrdinal().domain(this.parties.slice(0, 9)).range(this.colors.slice(0, 9))
               } else{
                        
                        let max_value = 0;
                        counts.forEach(d => {
                                if(d[parseInt(displayType[1])] / d3.sum(d) > max_value)
                                        max_value = d[parseInt(displayType[1])] / d3.sum(d)
                        })

                        this.zScale = d3.scaleLinear([0, max_value], ["white", this.colors[parseInt(displayType[1])]])

                }


                //assemble data

                let combined_data = this.map_data.features.map((d) => [d, counts[d.id]])

                //console.log("Combined:", combined_data)
                //console.log("Map_data:", this.map_data.features)

                /*this.container.selectAll("path")
                        .data(this.map_data.features)
                        .enter()
                        .append("path")
                        .on("mouseover", (event) => { this.mouseoverEvent(event) })
                        .on("mouseout", (event) => { this.mouseoutEvent(event) })
                        .on("mousemove", (event) => { this.mousemoveEvent(event) })
                        .on("mousedown", (event, d) => { this.mousedownEvent(event, d) })
                        .attr("d", this.pathGenerator)
                        .style("fill", (d, idx) => this.determineColor(counts[idx], displayType))
                        .style("stroke", "lightgrey")
                */this.container.selectAll("path")
                        .data(combined_data)
                        .enter()
                        .append("path")
                        .on("mouseover", (event) => { this.mouseoverEvent(event) })
                        .on("mouseout", (event) => { this.mouseoutEvent(event) })
                        .on("mousemove", (event) => { this.mousemoveEvent(event) })
                        .on("mousedown", (event, d) => { this.mousedownEvent(event, d, displayType, target) })
                        .attr("d", (d) =>this.pathGenerator(d[0]))
                        .style("fill", (d) => this.determineColor(d[1], displayType))
                        .style("stroke", "lightgrey")
                        

                this.legend
                        .attr("transform", `translate(${this.width + this.margin.left + 30}, ${this.margin.top})`)
                        .style("display", "inline")
                        .call(d3.legendColor().scale(this.zScale));
                
                //create tooltip
                this.tooltip.append("rect")
                            .attr("fill", "white")
                            .attr("stroke", "black")
                            .attr("height", this.tooltip_size)
                            .attr("width", this.tooltip_size)


        }


        getDisplayed(data, display_type){
                
                if(display_type === "11"){
                        let max = Math.max(...data)
                        if(max == 0)    return -1
                        let ret
                        if(data.indexOf(max) === 9)
                                ret = "Non-Voters"
                        else 
                                ret = this.parties[data.indexOf(max)]
                        return ret
               } if(display_type === "12"){
                        let tmp = Math.max(...data)
                        if(tmp == 0)    return -1
                        let idx = data.indexOf(tmp)
                        data[idx] = -Infinity;

                        let ret
                        let max = Math.max(...data)  
                        if(max == 0){
                                data[idx] = tmp;
                                return -1
                        }
                        if(data.indexOf(max) === 9)
                                ret = "Non-Voters"
                        else 
                                ret = this.parties[data.indexOf(max)]
                        data[idx] = tmp;
                        return ret
                }

                return undefined 

        }


        determineColor(data, display_type){
       
                if(display_type === "11" || display_type == "12"){
                        let ret = this.getDisplayed(data, display_type)
                        if(ret == -1)   return "white"
                        return this.zScale(ret)
               
                }
                return this.zScale(data[parseInt(display_type[1])] / d3.sum(data))


        }
        mouseoverEvent(event){

                //Make Tooltip visible
                this.tooltip.style("display", null)
                
                //Mark target as hovered
                let target = d3.select(event.target)
                target.classed("hovered", true)


                //Format Data Here=========

                //======================
               
                this.tooltip.append("path")

                //Append Contents here =====================
                let text = ["Placeholder Tooltip"]
                //=========================================

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

                path.rect(-5, -5, group.width + 10, group.height + 5)

                this.tooltip.select("path")
                                .attr("d", path.toString())
                                .attr("stroke", "black")
                                .attr("fill", "white")


                this.mousemoveEvent(event)
        }
        mouseoutEvent(event){
                let target = d3.select(event.target)

                target.classed("hovered", false)
                this.tooltip.style("display", "none")
                this.tooltip.selectAll("text").remove()
                this.tooltip.selectAll("path").remove()
                
        }


        mousemoveEvent(event){
                let rect = this.svg.node().getBoundingClientRect();
                if(event.pageY - rect.y + 20 + this.tooltip_size < this.width)         
                        this.tooltip.attr("transform", `translate(${event.pageX - rect.x + 20}, ${event.pageY - rect.y + 20})`)
                else
                        this.tooltip.attr("transform", `translate(${event.pageX - rect.x + 20}, ${event.pageY - rect.y - 40 - 1/2 * this.tooltip_size})`)

        }


        mousedownEvent(event, d, display_type, t){

                let party = ""

                //console.log("DP: ", display_type)

                if(display_type === "11" || display_type === "12"){
                        party = this.parties.indexOf(this.getDisplayed(d[1], display_type)) + 1
                        if(party === 0){
                                t = "vote"
                                party = 2
                        }
               } else
                        party = display_type[1]

                includeSelect.addItems([["region", this.states[d[0].id]], [t, party]])
                excludeSelect.addItems([["region", this.states[d[0].id]], [t, party]])
                
                includeSelect.display(event.target)
                excludeSelect.display(event.target)



        }


}
