const mongoose = require("mongoose");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
//* the connect method returns a promise.
//* This connection string is hardcoded, but in a real app it should be located in a cfg file.
mongoose
  .connect("mongodb://localhost/mongo-exercises")
  .then(() => console.log("connected to MongoDB..."))
  .catch(err => console.log("Could not connect to MongoDB...", err.message));

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  author: String,

  tags: {
    type: Array,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: "A course should have at least one tag."
    }
  },

  date: { type: Date, default: Date.now },
  isPublished: Boolean,
  category: {
    type: String,
    required: true,
    enum: ["web", "mobile", "network"]
  },
  price: {
    type: Number,
    required: function() {
      return this.isPublished;
    },
    min: 10,
    max: 200,
    get: v => Math.round(v)
  }
});

//* Generates the Course class
const Course = mongoose.model("Course", courseSchema);

////////////////////
//! [C]-RUD
////////////////////
//* This creates a new course
async function createCourse() {
  const course = new Course({
    author: "Larry",
    category: "-",
    tags: null,
    isPublished: false,
    price: 15,
    name: "Tester series 3"
  });
  try {
    const result = await course.save();
    console.log(result);
  } catch (ex) {
    for (field in ex.errors) console.log(ex.errors[field].message);
  }
}

////////////////////
//! C-[R]-UD
////////////////////

//* This just returns all documents in the DB.
async function getCourses() {
  const courses = await Course.find();
  if (!courses) return console.log("Course Not Found");
  console.log(courses);
}

//* This looks for courses that pass a filter: isPublished = true OR Price is gte 15 AND has "by" in the name somewhere.
async function getFilteredCourses() {
  return await Course.find({ isPublished: true }).or([
    { price: { $gte: 15 } },
    { name: /.*by.*/i }
  ]);
}

async function getLarry() {
  const Larry = await Course.find({ author: /Larry/i });
  if (!Larry) return console.log("Somethings broke");
  console.log(Larry);
}

//* This looks for a single document in the DB (Note: needs to have an objectID for the keyID in the DB.)
async function getCourse(id) {
  console.log("attempting to search for:", id);
  const course = await Course.findById(id);
  //if (!course) return console.log("Course Not Found");
  console.log(course);
}

//* This gets the courses in a "paged" way
async function getPagedCourses() {
  const pageNumber = 1;
  const pageSize = 10;

  return await Course.find({ author: /Larry/i })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort({ name: 1 })
    .select({ name: 1, tags: 1, price: 1 });
}

////////////////////
//! CR-[U]-D
////////////////////

//* This looks for a single document in the DB that has an objectID set for KeyID then if it exists updates values in it.
async function updateCourse(id) {
  console.log("attempting to search for: ", id);
  const course = await Course.findById(id);
  if (!course) return console.log("Course Not Found"); //If the course doesn't exist, return immediately

  //Update data Method #1
  course.isPublished = true;
  course.author = "Larry Pulling out Hair";

  const result = await course.save();
  console.log(result);
}

//* This blind updates the DB and returns a simple verification of how many documents I've edited.
async function blindupdateCourse(id) {
  const result = await Course.update(
    { _id: id },
    { $set: { author: "Larry", isPublished: false } }
  );
  console.log(result);
}

//* This returns the original document from the DB
async function updateAndReturnOriginalCourse(id) {
  const course = await Course.findByIdAndUpdate(id, {
    $set: {
      author: "Lisa",
      isPublished: true
    }
  });
  console.log(course);
}

//* This returns the updated document from the DB
async function updateAndReturnCourse(id) {
  const course = await Course.findByIdAndUpdate(
    id,
    {
      $set: {
        author: "Ted",
        isPublished: false
      }
    },
    { new: true }
  );
  console.log(course);
}

////////////////////
//! CRU-[D]
////////////////////

//* This deletes a single document, specified by id, from the DB
async function removeCourse(id) {
  const result = await Course.deleteOne({ _id: id });
  console.log(result);
}

const log = getPagedCourses();
log.then(result => {
  console.log(result);
  result.forEach(element => console.log(element.price));
});
