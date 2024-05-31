
class Filter{

        //[TODO] add options for equal or unequal (maybe)

        constructor(){

                this.keys = new Array();
                this.values = new Array();
                this.pairs = 0;
        }

        addFilter(key, value){
                this.keys.push(key)
                this.values.push(value)
                this.pairs += 1
        }

        applyFilter(data){

                //console.log(data)

                this.keys.forEach((n, idx) => {
                        //data.forEach(D => console.log(D[n], this.values[idx]))
                        data = data.filter( D => (D[n] === this.values[idx]))

                })
                
                //console.log(data)
                
                return data;

        }


        has(key){

                return (this.keys.indexOf(key) != -1)

        }

        value(key){

                if(!this.has(key))
                        return None

                return (this.values[this.keys.indexOf(key)])
        }

        getArray(){
                let arr = []
                this.keys.forEach((d) => {arr.push([d, this.value(d)])})
                return arr
        }

}



class Histogram{

        red = "#ea9073";
        blue = "#80b9d7";

        tooltip_size = 0;

        constructor(svg, data, width = 250, height = 250, margin, filter){

                this.svg = svg;
                this.data = data;
                this.width = width;
                this.height = height;
                this.margin = margin

                this.glFilter = filter

        }


        getTexture(filter){

                let text = textures.lines()

                let color = 'lightgrey';

                if(filter.has("gndr")){
                        color = filter.value("gndr") === 1 ? this.blue : this.red
                }

                text = text.background(color);

                if(!filter.has("blgetmg") || filter.value("blgetmg") === 2){
                        text = text.stroke(color) 
                }

                return text

        }

        initialize(){
                
                this.current_year = 2018

                this.container = this.svg.append("g");
                this.xAxis = this.svg.append("g");
                this.yAxis = this.svg.append("g");
                this.legend = this.svg.append("g");
                this.tooltip = this.svg.append("g")
                                       .style("display", "none")


                this.xScale = d3.scaleLinear().range([0, this.width]);
                this.yScale = d3.scaleLinear().range([this.height, 0])

                let text = textures.lines().thicker()
                this.svg.call(text)

                this.zScale = d3.scaleOrdinal().domain(["male", "female", "ethn. maj.", "ethn. min."]).range([this.blue, this.red, "lightgrey", text.url()])

                this.svg
                        .attr("width", this.width + this.margin.left + this.margin.right)
                        .attr("height", this.height + this.margin.top + this.margin.bottom);

                this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        }

        update(num_bins, gender = false, minority = false, slider = false){


                this.container.selectAll("*").remove()
                
                //console.log("Histogram with Filter :")
                //this.glFilter.printFilter()
                
                let data = this.glFilter.applyFilter(this.data)

                //console.log(data)

                //Create bins based on all valid year numbers in accordance with the selected bin number
                let bin = d3.bin().value((d) => d.yrbrn)
                                   .thresholds((data, min, max) =>
                                        d3.range(num_bins).map(t => min + Math.ceil(t/num_bins * (max-min)))
                                   )
               

                data = d3.filter(data, (d) => d.yrbrn < 3000)
                let bins = bin(data)
               

                

               //console.log(bins)


                //declare the filters 
                let filter = []
       
                if(gender && minority){
                        filter.push(new Filter())
                        filter.push(new Filter())
                        filter.push(new Filter())
                        filter.push(new Filter())
                        filter[0].addFilter("gndr", 1)
                        filter[0].addFilter("blgetmg", 1)
                        filter[1].addFilter("gndr", 1)
                        filter[1].addFilter("blgetmg", 2)
                        filter[2].addFilter("gndr", 2)
                        filter[2].addFilter("blgetmg", 1)
                        filter[3].addFilter("gndr", 2)
                        filter[3].addFilter("blgetmg", 2)
                }else if(gender){
                        filter.push(new Filter())
                        filter.push(new Filter())
                        filter[0].addFilter("gndr", 1)
                        filter[1].addFilter("gndr", 2)
                }else if(minority){
                        filter.push(new Filter())
                        filter.push(new Filter())
                        filter[0].addFilter("blgetmg", 1)
                        filter[1].addFilter("blgetmg", 2)
                }else{
                        filter.push(new Filter())
                }






                
        

                this.xScale = this.xScale.domain([this.current_year - bins.slice(-1)[0].x1, this.current_year - bins.slice(0)[0].x0])
                this.yScale = this.yScale.domain([0, d3.max(Object.values(bins.map(d => d.length)))])


                //initialize offsets for rectangle stacking
                let offset = []
                bins.forEach((d) => offset.push(0))


                filter.forEach((F) => {


                        //filter bin entries according to the current filter
                        let filtered_bins = []

                        bins.forEach((D) => {
                                let arr = F.applyFilter(D)
                                arr.x0 = D.x0
                                arr.x1 = D.x1

                                filtered_bins.push(arr)
                        });

                        //load the fill texture, based on gender and ethnicity
                        let text = this.getTexture(F)
                        this.svg.call(text)


                        //taken from https://stackoverflow.com/questions/60372232/how-to-add-conditional-transitions

                        d3.selection.prototype.condTrans = function (slider ){return slider ? this : this.transition()}

                        //add the rectangles
                        this.rects = this.container.append("g")
                                .selectAll("rect")
                                .data(filtered_bins)
                                .join("rect")
                                .on("mouseover", (event, d) => { this.mouseoverEvent(event, d, F, data.length) })
                                .on("mouseout", (event) => { this.mouseoutEvent(event) })
                                .on("mousemove", (event) => { this.mousemoveEvent(event) })
                                .on("mousedown", (event, d) => { this.mousedownEvent(event, d, F) })

                        this.rects.condTrans(slider)
                                //.transition()
                                .attr("x", (d, idx) => this.xScale(this.current_year-d.x1))
                                .attr("y", (d, idx) => this.yScale(offset[idx] + d.length))
                                .attr("fill", text.url() )
                                .attr("width", (d, idx) => this.xScale(this.current_year-d.x0) - this.xScale(this.current_year-d.x1))
                                .attr("height", (d, idx) => this.height - this.yScale(d.length) )
                                .attr("stroke", d => 'black')
                                .attr("stroke-width", d => 1)



                        //adjust offsets, so that the next rectangles stack on top
                        filtered_bins.forEach((d, idx) => offset[idx] += d.length)


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
                                .attr("transform", `translate(${this.width + this.margin.left + 5}, ${this.margin.top})`)

                                .style("display", "inline")
                                .call(d3.legendColor().scale(this.zScale));


                //create tooltip
                this.tooltip.append("rect")
                            .attr("fill", "white")
                            .attr("stroke", "black")
                            .attr("height", this.tooltip_size)
                            .attr("width", this.tooltip_size)

        }
        
        mouseoverEvent(event, d, F, total){

                //console.log("Over!")

                //Make Tooltip visible
                this.tooltip.style("display", null)
                
                //Mark target as hovered
                let target = d3.select(event.target)
                target.classed("hovered", true)


                //Format Data Here=========

                //======================
               
                this.tooltip.append("path")

                //Append Contents here =====================
                let text = [["Age", this.current_year - d.x1, "to", this.current_year - d.x0].join(' ')]

                F.getArray().forEach((d) => {
                        if(d[0] == "gndr")
                                text.push([ ((d[1] == 1) ? "Male" : "Female")])
                        if(d[0] == "blgetmg")
                                text.push([ ((d[1] == 1) ? "Ethnic Minority" : "Ethnic Majority")])
                                })
                text.push([d.length, "(", Math.round(d.length / total * 10000) / 100 , "%) out of", total].join(' '))




                //=========================================

                let txt = this.tooltip.append("text")
                                .selectAll("tspan")
                                .data(text)
                                .join("tspan")
                                .text((d) => d)
                                .attr("font-size", "0.8em")
                                .attr("font-weight", (d, idx) => idx > F.getArray().length ? "" : "bold")
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
                let tt = this.tooltip.node().getBoundingClientRect();
                let graph = this.container.node().getBoundingClientRect();


                let add_x = this.width + 2 * this.margin.right
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

        }
        



        mousedownEvent(event, d, F){

                let items = F.getArray()

                items.push(["yrbrn", [d.x0, d.x1]])

                includeSelect.addItems(items)
                excludeSelect.addItems(items)
                
                includeSelect.display(event.target)
                excludeSelect.display(event.target)



        }





}
