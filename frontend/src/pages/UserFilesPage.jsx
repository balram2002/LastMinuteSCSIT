"use client";

import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    FileText,
    Calendar,
    Book,
    Tag,
    Edit,
    Trash2,
    X,
    Loader,
    AlertCircle,
    ShieldCheck,
    GraduationCap,
    FileX,
    Upload,
    View,
    BookDashed,
    FolderOpen,
    CalendarClock,
    BookOpen,
    Filter,
    ChevronDown,
} from "lucide-react";
import FileViewer from "../fileComponents/FileViewer";
import { API_URL } from "../utils/urls";
import { useSwipeable } from "react-swipeable";
import { ValuesContext } from "../context/ValuesContext";
import { toast } from "react-hot-toast";
import {
    courses as courseOptions,
    semestersByCourse,
    subjectsByCourseAndSemester,
} from "../utils/Data";

const useOnClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) return;
            handler(event);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
};

const FilterDropdown = ({ options, value, onChange, allLabel }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef();
    useOnClickOutside(ref, () => setIsOpen(false));
    const selectedOption = options.find((opt) => opt.value === value);
    const displayLabel =
        value === "all" ? allLabel : selectedOption?.label || allLabel;
    return (
        <div ref={ref} className="relative w-full sm:w-auto">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between gap-2 bg-gray-700/50 rounded-xl border border-gray-600 px-4 py-2 text-white hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
            >
                <div className="flex items-center gap-2 truncate">
                    <Filter size={16} />
                    <span className="capitalize truncate text-sm">{displayLabel}</span>
                </div>
                <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-30 mt-2 w-56 origin-top-left rounded-xl border border-gray-700 bg-gray-900/90 shadow-lg backdrop-blur-lg"
                    >
                        <ul className="p-1 max-h-60 overflow-y-auto">
                            <li>
                                <button
                                    onClick={() => {
                                        onChange("all");
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left block rounded-lg px-4 py-2 text-white hover:bg-green-500/10"
                                >
                                    {allLabel}
                                </button>
                            </li>
                            {options.map((opt) => (
                                <li key={opt.value}>
                                    <button
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left block rounded-lg px-4 py-2 text-white capitalize hover:bg-green-500/10 truncate"
                                    >
                                        {opt.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const UserFilesPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [files, setFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [selectedViewFile, setSelectedViewFile] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');

    const [categoryFilter, setCategoryFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate("/");
            return;
        }

        const fetchFiles = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/api/files/adminfiles`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({ userId: user._id }),
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Failed to fetch files.');
                }

                setFiles(result.data);

            } catch (err) {
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFiles();
    }, [user, navigate]);

    useEffect(() => {
        let tempFiles = [...files];
        if (categoryFilter !== "all") {
            tempFiles = tempFiles.filter((file) => file.category === categoryFilter);
        }
        if (courseFilter !== "all") {
            tempFiles = tempFiles.filter((file) => file.course === courseFilter);
        }
        if (subjectFilter !== "all") {
            tempFiles = tempFiles.filter((file) => file.subject === subjectFilter);
        }
        setFilteredFiles(tempFiles);
    }, [categoryFilter, courseFilter, subjectFilter, files]);

    const subjectsList = useMemo(() => {
        const uniqueSubjects = [...new Set(files.map((file) => file.subject))].filter(Boolean);
        return uniqueSubjects.map((subject) => ({ value: subject, label: subject }));
    }, [files]);

    const { stats, coursesList, categories } = useMemo(() => {
        const courseList = [...new Set(files.map((file) => file.course))].filter(
            Boolean,
        );
        const categoryList = [
            ...new Set(files.map((file) => file.category)),
        ].filter(Boolean);
        return {
            stats: {
                totalFiles: files.length,
                courses: courseList.length,
                categories: categoryList.length,
            },
            coursesList: courseList.map((c) => ({ value: c, label: c })),
            categories: categoryList.map((c) => ({ value: c, label: c })),
        };
    }, [files]);

    const openEditModal = (file) => {
        setSelectedFile(file);
        setEditFormData({
            name: file.name ?? "",
            course: file.course ?? "",
            semester: file.semester ?? "",
            subject: file.subject ?? (file.semester === "0" ? "Whole Semester" : ""),
            year: file.year ?? "",
            category: file.category ?? null,
        });
        setModalError('');
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        if (isSubmitting) return;
        setIsEditModalOpen(false);
        setSelectedFile(null);
    };

    const openDeleteModal = (file) => {
        setSelectedFile(file);
        setModalError('');
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (isSubmitting) return;
        setIsDeleteModalOpen(false);
        setSelectedFile(null);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateFile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setModalError('');
        try {
            const payload = {
                id: selectedFile?._id,
                name: editFormData.name?.trim(),
                course: editFormData.course,
                semester: editFormData.semester,
                subject: editFormData.subject,
                year: editFormData.year,
                category: editFormData.category,
                userId: user?._id,
            };

            const response = await fetch(`${API_URL}/api/files/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to update file.');
            }

            setFiles(files.map(f => f._id === selectedFile._id ? result.data : f));
            closeEditModal();
            toast.success("File updated successfully!");

        } catch (err) {
            setModalError(err.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteFile = async () => {
        setIsSubmitting(true);
        setModalError('');
        try {
            const response = await fetch(`${API_URL}/api/files/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    id: selectedFile._id,
                    userId: user._id,
                }),
            });

            if (response.status === 204) {
                setFiles(files.filter(f => f._id !== selectedFile._id));
                closeDeleteModal();
                toast.success("File deleted successfully!");
                return;
            }

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to delete file.');
            }

            setFiles(files.filter(f => f._id !== selectedFile._id));
            closeDeleteModal();
            toast.success("File deleted successfully!");

        } catch (err) {
            setModalError(err.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseViewer = () => {
        setSelectedViewFile(null);
    };

    const handleFileClick = (file, subject) => {
        setSelectedViewFile(file);
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [])

    const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext);

    const isExcludedRoute = location.pathname.startsWith("/login") || location.pathname === "/signup";
    const isMobile = window.innerWidth <= 768;
    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => {
            if (isMobile && !isExcludedRoute) {
                setIsSidebarOpen(true);
                console.log("Swiped left - opening sidebar");
            }
        },
        preventDefaultTouchmoveEvent: false,
        trackMouse: false,
        delta: 30,
    });

    const getOrdinalSuffix = (n) => {
        const s = ["th", "st", "nd", "rd"],
            v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    const availableSemesters = editFormData.course
        ? (semestersByCourse?.[editFormData.course]?.map((sem) => ({
            value: sem,
            label:
                sem === "0"
                    ? "All Semesters"
                    : `${sem}${getOrdinalSuffix(parseInt(sem, 10))} Semester`,
        })) ?? [])
        : [];

    const getSubjectsForCourseAndSemester = (course, semester) => {
        const semesterData = subjectsByCourseAndSemester?.[course]?.[semester];
        if (Array.isArray(semesterData)) return semesterData;
        if (semesterData?.subjects)
            return semesterData.subjects.map((sub) => sub.name || sub);
        return [];
    };

    const availableSubjects =
        editFormData.course && editFormData.semester
            ? getSubjectsForCourseAndSemester(editFormData.course, editFormData.semester).map(
                (sub) => ({ value: sub, label: sub }),
            )
            : [];

    useEffect(() => {
        if (editFormData.semester === "0") {
            setEditFormData(prev => ({ ...prev, subject: "Whole Semester" }));
        }
    }, [editFormData.semester]);

    return (
        <>
            <div {...swipeHandlers} className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center p-0 pb-8 pt-24">
                <Helmet>
                    <title>My Uploaded Files - SCSIT</title>
                    <meta name="description" content="Manage your uploaded files." />
                </Helmet>

                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-2xl border border-gray-700 p-6 mb-8">
                            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
                                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                                    {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || <User size={32} />}
                                </div>
                                <div className="flex-grow text-center md:text-left">
                                    <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                                    <p className="text-green-400 flex items-center justify-center md:justify-start gap-2 mt-1"><Mail size={16} /> {user?.email}</p>
                                    {user?.isAdmin === 'admin' && <p className="text-amber-400 flex items-center justify-center md:justify-start gap-2 mt-1 font-semibold"><ShieldCheck size={16} /> Admin Account</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700 flex flex-col items-center">
                                    <FolderOpen className="text-green-400 mb-1" size={24} />
                                    <span className="text-xs text-gray-400">Files</span>
                                    <span className="text-2xl font-bold text-white">{stats.totalFiles}</span>
                                </div>
                                <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700 flex flex-col items-center">
                                    <BookOpen className="text-blue-400 mb-1" size={24} />
                                    <span className="text-xs text-gray-400">Courses</span>
                                    <span className="text-2xl font-bold text-white">{stats.courses}</span>
                                </div>
                                <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700 flex flex-col items-center">
                                    <GraduationCap className="text-amber-400 mb-1" size={24} />
                                    <span className="text-xs text-gray-400">Categories</span>
                                    <span className="text-2xl font-bold text-white">{stats.categories}</span>
                                </div>
                                <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700 flex flex-col items-center">
                                    <Book className="text-purple-400 mb-1" size={24} />
                                    <span className="text-xs text-gray-400">Subjects</span>
                                    <span className="text-2xl font-bold text-white">{subjectsList.length}</span>
                                </div>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-6 text-center">Your Uploaded Files</h2>
                        <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 mb-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <FilterDropdown
                                    options={categories}
                                    value={categoryFilter}
                                    onChange={setCategoryFilter}
                                    allLabel="All Categories"
                                />
                                <FilterDropdown
                                    options={coursesList}
                                    value={courseFilter}
                                    onChange={setCourseFilter}
                                    allLabel="All Courses"
                                />
                                <FilterDropdown
                                    options={subjectsList}
                                    value={subjectFilter}
                                    onChange={setSubjectFilter}
                                    allLabel="All Subjects"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader className="w-12 h-12 text-green-400 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400 bg-red-500/10 p-6 rounded-2xl flex items-center justify-center gap-3">
                            <AlertCircle size={24} />
                            <span className="text-lg">{error}</span>
                        </div>
                    ) : filteredFiles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFiles.map((file, index) => (
                                <motion.div
                                    key={file._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden flex flex-col h-full"
                                >
                                    <div className="p-5 flex-grow">
                                        <h3 className="text-lg md:text-xl font-bold text-white mb-3 line-clamp-2">
                                            {file.name || "Untitled File"}
                                        </h3>
                                        <div className="space-y-2 text-gray-300 text-sm">
                                            <p className="flex items-start gap-2">
                                                <BookDashed
                                                    size={16}
                                                    className="text-green-400 mt-0.5 flex-shrink-0"
                                                />
                                                <span className="truncate">{file.course || "N/A"}</span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <Book
                                                    size={16}
                                                    className="text-green-400 mt-0.5 flex-shrink-0"
                                                />
                                                <span className="truncate">
                                                    {file.subject || "N/A"}
                                                </span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <GraduationCap
                                                    size={16}
                                                    className="text-green-400 mt-0.5 flex-shrink-0"
                                                />
                                                <span>
                                                    {file.course
                                                        ? `${file.course} - Sem ${file.semester || "N/A"}`
                                                        : "N/A"}
                                                </span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <Calendar
                                                    size={16}
                                                    className="text-green-400 mt-0.5 flex-shrink-0"
                                                />
                                                <span>Year: {file.year || "N/A"}</span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <Tag
                                                    size={16}
                                                    className="text-green-400 mt-0.5 flex-shrink-0"
                                                />
                                                <span className="font-semibold capitalize">
                                                    Category: {file.category || "N/A"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-900/50 p-3 grid grid-cols-3 gap-2">
                                        <motion.button
                                            onClick={() => handleFileClick(file)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                        >
                                            <View size={14} /> View
                                        </motion.button>
                                        <motion.button
                                            onClick={() => openEditModal(file)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            <Edit size={14} /> Edit
                                        </motion.button>
                                        <motion.button
                                            onClick={() => openDeleteModal(file)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700"
                        >
                            <div className="mx-auto bg-gray-800/50 w-24 h-24 rounded-full flex items-center justify-center border border-gray-700">
                                <FileX className="w-12 h-12 text-gray-500" />
                            </div>
                            <h3 className="mt-6 text-2xl font-bold text-white">
                                No Files Found
                            </h3>
                            <p className="mt-2 text-gray-400 max-w-md mx-auto">
                                No files match the selected filters.
                            </p>
                            <motion.button
                                onClick={() => navigate('/upload')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                            >
                                <Upload size={18} />
                                Upload Your First File
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isEditModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-700 w-full max-w-4xl my-8"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-gray-700">
                                <h3 className="text-xl font-bold text-white">
                                    Edit File Details
                                </h3>
                                <button
                                    onClick={closeEditModal}
                                    className="text-gray-400 hover:text-white disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    <X />
                                </button>
                            </div>
                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Paper Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editFormData.name || ''}
                                        onChange={handleEditFormChange}
                                        placeholder="Enter paper name"
                                        className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-green-500 text-white placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Course
                                    </label>
                                    <select
                                        name="course"
                                        value={editFormData.course || ''}
                                        onChange={handleEditFormChange}
                                        className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-green-500 text-white"
                                    >
                                        <option value="">Select Course</option>
                                        {courseOptions.map((course) => (
                                            <option key={course.value} value={course.value}>
                                                {course.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Semester
                                    </label>
                                    <select
                                        name="semester"
                                        value={editFormData.semester || ''}
                                        onChange={handleEditFormChange}
                                        disabled={!editFormData.course}
                                        className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-green-500 text-white disabled:opacity-50"
                                    >
                                        <option value="">Select Semester</option>
                                        {availableSemesters.map((sem) => (
                                            <option key={sem.value} value={sem.value}>
                                                {sem.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {editFormData.semester !== "0" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Subject
                                        </label>
                                        <select
                                            name="subject"
                                            value={editFormData.subject || ''}
                                            onChange={handleEditFormChange}
                                            disabled={
                                                !editFormData.course ||
                                                !editFormData.semester ||
                                                editFormData.semester === "0"
                                            }
                                            className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-green-500 text-white disabled:opacity-50"
                                        >
                                            <option value="">Select Subject</option>
                                            {availableSubjects.map((sub) => (
                                                <option key={sub.value} value={sub.value}>
                                                    {sub.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="flex flex-col sm:flex-row sm:space-x-4">
                                    <div className="flex-1 mb-4 sm:mb-0">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Category
                                        </label>
                                        <select
                                            name="category"
                                            value={editFormData.category || ''}
                                            onChange={handleEditFormChange}
                                            className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-green-500 text-white mt-2"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="paper">Paper</option>
                                            <option value="notes">Notes</option>
                                            <option value="syllabus">Syllabus</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Year
                                        </label>
                                        <input
                                            type="text"
                                            name="year"
                                            value={editFormData.year || ''}
                                            onChange={handleEditFormChange}
                                            placeholder="e.g., 2023"
                                            className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-green-500 text-white placeholder-gray-400"
                                        />
                                    </div>
                                </div>
                                {modalError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center space-x-2 p-4 rounded-lg bg-red-600/20 border border-red-500"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                        <span className="text-red-300 text-sm">{modalError}</span>
                                    </motion.div>
                                )}
                            </div>
                            <div className="p-6 border-t border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
                                <motion.button
                                    type="button"
                                    onClick={closeEditModal}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    onClick={handleUpdateFile}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={
                                        isSubmitting ||
                                        !editFormData.name ||
                                        !editFormData.course ||
                                        !editFormData.semester ||
                                        !editFormData.subject ||
                                        !editFormData.category ||
                                        !/^\d{4}$/.test(editFormData.year || "")
                                    }
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center justify-center disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Update File"
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl p-8 text-center"
                        >
                            <div className="mx-auto bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mt-4">
                                Delete File?
                            </h3>
                            <p className="text-gray-300 mt-2">
                                Are you sure you want to delete{" "}
                                <strong className="text-white">
                                    "{selectedFile?.name || "this file"}"
                                </strong>
                                ? This action cannot be undone.
                            </p>
                            {modalError && (
                                <p className="text-red-400 text-sm mt-4">{modalError}</p>
                            )}
                            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                                <motion.button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    onClick={handleDeleteFile}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Delete"
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {selectedViewFile && <FileViewer file={selectedViewFile} onClose={handleCloseViewer} isAllFiles={true} />}
        </>
    );
};

export default UserFilesPage;