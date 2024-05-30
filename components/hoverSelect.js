
class HoverSelect{

        constructor(id, mode, filter){
                this.div = d3.select(id)

                this.mode = mode

                this.glFilter = filter

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
                                d3.select(event.target).classed("hovered", true)})
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
