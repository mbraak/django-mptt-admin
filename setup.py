from setuptools import setup, find_packages


version = '0.3.7'

setup(
    name='django-mptt-admin',
    version=version,
    packages=find_packages(),
    license='Apache License, Version 2.0',
    include_package_data=True,
    zip_safe=False,
    author='Marco Braak',
    author_email='mbraak@ridethepony.nl',
    install_requires=['django-mptt', 'six'],
    description='Django-mptt-admin provides a nice Django Admin interface for Mptt models',
    long_description=open('README.md').read(),
    url='https://github.com/mbraak/django-mptt-admin',
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Framework :: Django",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python :: 2.7",
        "Programming Language :: Python :: 3.3",
        "Programming Language :: Python :: 3.4",
        "Programming Language :: Python :: 3.5",
        "Programming Language :: Python :: Implementation :: CPython",
        "Programming Language :: Python :: Implementation :: PyPy"
    ]
)
