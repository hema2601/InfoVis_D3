
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

}



class Histogram{

        red = "#ea9073";
        blue = "#80b9d7";

        tooltip_size = 0;

        constructor(svg, data, width = 250, height = 250, margin){

                this.svg = svg;
                this.data = data;
                this.width = width;
                this.height = height;
                this.margin = margin

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

                this.zScale = d3.scaleOrdinal().domain(["male", "female", "ethnic minority", "ethnic majority"]).range([this.blue, this.red, "lightgrey", text.url()])

                this.svg
                        .attr("width", this.width + this.margin.left + this.margin.right)
                        .attr("height", this.height + this.margin.top + this.margin.bottom);

                this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        }

        update(num_bins, gender = false, minority = false, slider = false){


                this.container.selectAll("*").remove()

                //Create bins based on all valid year numbers in accordance with the selected bin number
                let bin = d3.bin().value((d) => d.yrbrn)
                                   .thresholds((data, min, max) =>
                                        d3.range(num_bins).map(t => min + Math.ceil(t/num_bins * (max-min)))
                                   )
               

                let bins = bin(d3.filter(this.data, (d) => d.yrbrn < 3000))
               

                

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






                
                let current_year = 2018
        

                this.xScale = this.xScale.domain([current_year - bins.slice(-1)[0].x1, current_year - bins.slice(0)[0].x0])
                this.yScale = this.yScale.domain([0, d3.max(Object.values(bins.map(d => d.length)))])


                //initialize offsets for rectangle stacking
                let offset = []
                bins.forEach((d) => offset.push(0))


                filter.forEach((F) => {


                        //filter bin entries according to the current filter
                        let filtered_bins = bins.map(D => F.applyFilter(D));

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
                                .on("mouseover", (event) => { this.mouseoverEvent(event) })
                                .on("mouseout", (event) => { this.mouseoutEvent(event) })
                                .on("mousemove", (event) => { this.mousemoveEvent(event) })

                        this.rects.condTrans(slider)
                                //.transition()
                                .attr("x", (d, idx) => this.xScale(current_year-bins[idx].x1))
                                .attr("y", (d, idx) => this.yScale(offset[idx] + d.length))
                                .attr("fill", text.url() )
                                .attr("width", (d, idx) => this.xScale(current_year-bins[idx].x0) - this.xScale(current_year-bins[idx].x1))
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
        








}
