
class HoverSelect{

        constructor(id, mode, filter){
                this.div = d3.select(id)

                this.mode = mode

                this.glFilter = filter

                this.primary = "darkgrey"
                this.secondary = "lightgrey"
                if(mode === "inc"){
                        this.primary = "green"
                        this.secondary = "yellowgreen"
                }
                if(mode === "exc"){
                        this.primary = "red"
                        this.secondary = "tomato"
                }

        }

        display(target){
                let dir = ""
                if(this.mode === "inc") dir = 'left'
                else                    dir = 'right'

                Popper.createPopper(target, this.div.node(), {
                        placement: dir,
                        modifiers: [
                                {
                                        name: 'offset',
                                        options: {
                                                offset: [0, 10],
                                        },
                                },
                        ],
                });
                this.div.style("display", null)
                this.div.style("background-color", (this.mode === 'inc') ? "green" : "red")

        }

        addItems(items){



                this.div.selectAll("div")
                        .data(items)
                        .join("div")
                        .html((d) => `${d[0]} = ${d[1]}`)
                        .on("mouseover", (event) => {
                                //console.log("Hovered")
                                d3.select(event.target).style("background-color", this.secondary)})
                        .on("mouseout", (event) => {
                                //console.log("Hovered")
                                d3.select(event.target).style("background-color", this.primary)})
                        .on("mouseup", (event, d) => {
                                //console.log("Selected Exclude")
                                this.glFilter.addFilter(d[0], d[1], this.mode)
                        })


        }

        clear(){
                this.div.style("display", "none")
                        .selectAll("*")
                        .remove()

        }

}
